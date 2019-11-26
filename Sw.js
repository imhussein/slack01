let version = 1;
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
