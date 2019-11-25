let version = 1;

self.addEventListener("install", onInstall);
self.addEventListener("activate", onActivate);

async function main() {
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
