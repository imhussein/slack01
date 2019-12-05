let version = 6;
let isOnline = true;
let isAuthenticated = false;
let versionName = `Ramblings-${version}`;
let urlsToCache = {
  loggedOutResources: [
    "/",
    "/add",
    "/index.js",
    "/materialize.css",
    "/materialize.js",
    "/index.css",
    "/image.jpeg"
  ]
};

self.addEventListener("install", onInstall);
self.addEventListener("activate", onActivate);
self.addEventListener("message", onMessage);
self.addEventListener("fetch", onFetch);

function onFetch(event) {
  event.respondWith(router(event.request));
}

async function router(req) {
  var url = new URL(req.url);
  var reqUrl = url.pathname;
  var cache = await caches.open(versionName);
  if (url.origin == location.origin) {
    let res;
    try {
      let fetchOptions = {
        credentials: "omit",
        headers: req.headers,
        method: req.method,
        cache: "no-store"
      };
      res = await fetch(req.url, fetchOptions);
      if (res && res.ok) {
        await cache.put(reqUrl, res.clone());
        return res;
      }
    } catch (error) {
      console.log(error);
    }
    res = await cache.match(reqUrl);
    if (res) {
      return res.clone();
    }
  }
}

function onMessage(e) {
  const { data } = e;
  if (data.statusUpdate) {
    ({ isAuthenticated, isOnline } = data.statusUpdate);
    console.log(
      `Service Worker Version V${version} is Running And Online Status is ${isOnline} and And Authientication Status is ${isAuthenticated}`
    );
  }
}

async function sendMessage(message) {
  let allClients = await clients.matchAll({
    includeUncontrolled: true
  });
  return Promise.all(
    allClients.map(function mapClient(client) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = onMessage;
      return client.postMessage(message, [messageChannel.port2]);
    })
  );
}

async function main() {
  await sendMessage({ requestStatusUpdate: true });
  await cacheLoggedOutFiles();
  console.log(`Service Worker Version v${version} is Starting`);
}

main().catch(err => {
  console.log(err);
});

function onInstall() {
  self.skipWaiting();
  console.log(`Service Worker Version v${version} is Installing`);
}

function onActivate(e) {
  e.waitUntil(handleActivation());
}

async function handleActivation() {
  await clearCache();
  await clients.claim();
  console.log(`Service Worker Version v${version} is Activating`);
}

async function cacheLoggedOutFiles(forceReload = false) {
  const cache = await caches.open(versionName);
  return Promise.all(
    urlsToCache.loggedOutResources.map(async function cacheFile(file) {
      try {
        let res;
        if (!forceReload) {
          res = await cache.match(file);
          if (res) return res;
        }
        let fetchOptions = {
          method: "GET",
          credentials: "omit",
          cache: "no-cache"
        };
        res = await fetch(file, fetchOptions);
        if (res.ok) {
          await cache.put(file, res);
        }
      } catch (error) {
        console.log(error);
      }
    })
  );
}

async function clearCache() {
  let cacheNames = await caches.keys();
  let oldCaches = cacheNames.filter(function filterOldCache(cacheName) {
    if (/^Ramblings-\d+/.test(cacheName)) {
      let [_, cacheVersion] = cacheName.match(/^Ramblings-(\d+)$/);
      cacheVersion =
        cacheVersion !== null ? Number(cacheVersion) : cacheVersion;
      return cacheVersion > 0 && cacheVersion !== version;
    }
  });
  return Promise.all(
    oldCaches.map(function clearOldCacheNames(cache) {
      return caches.delete(cache);
    })
  );
}
