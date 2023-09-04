importScripts('https://www.gstatic.com/firebasejs/4.13.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.13.0/firebase-messaging.js');

firebase.initializeApp({
  messagingSenderId: "631002885321"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {});