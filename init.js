let isOnline = "onLine" in navigator;
let isAuthenticated = true;
let svcWorker;
let swRegisteration;
let statusIcon = document.querySelector(".status-icon");

// Send Service Worker Message
function sendMessageFromServiceWorker(target, message) {
  if (target) {
    target.postMessage(message);
  } else if (svcWorker) {
    svcWorker.postMessage(message);
  } else {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

// Send SWMessage
function sendSWMessage(target) {
  sendMessageFromServiceWorker(target, {
    statusUpdate: { isAuthenticated, isOnline }
  });
}

// On Message Handler
function onMessage(e) {
  const { data } = e;
  if (data.requestStatusUpdate) {
    sendSWMessage(e.ports && e.ports[0]);
  }
}

// Init Service Worker Registeration And On Controller Change event
async function initServiceWorker() {
  swRegisteration = await navigator.serviceWorker.register("/Sw.js", {
    updateViaCache: "none"
  });

  // Get Service From Current State
  svcWorker =
    swRegisteration.installing ||
    swRegisteration.waiting ||
    swRegisteration.active;

  sendSWMessage(svcWorker);

  // Get Service Worker From Contoller Change And New Service Worker is Active
  navigator.serviceWorker.oncontrollerchange = function() {
    // Run Skip Waiting Phase From Service Worker On Installing New Service Worker
    svcWorker = navigator.serviceWorker.controller;
    console.log("New Service Worker is controlling the clients");
    sendSWMessage(svcWorker);
  };

  // Listen To Messages Coming From Service Worker
  navigator.serviceWorker.onmessage = function(e) {
    sendSWMessage(svcWorker);
  };
}

// Check For Online Event
window.ononline = function(e) {
  isOnline = true;
  statusIcon.classList.add("online");
  statusIcon.classList.remove("offline");
  sendSWMessage();
};

// Check For Offline Event
window.onoffline = function() {
  isOnline = false;
  statusIcon.classList.add("offline");
  statusIcon.classList.remove("online");
  sendSWMessage();
};

initServiceWorker();
