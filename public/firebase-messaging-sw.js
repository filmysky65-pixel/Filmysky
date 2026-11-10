// Scripts for firebase and messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyC5D8XzHepXr_R4Nx01z4nUSGcFjbtt7h0",
  authDomain: "cineflix-7812a.firebaseapp.com",
  databaseURL: "https://cineflix-7812a-default-rtdb.firebaseio.com",
  projectId: "cineflix-7812a",
  storageBucket: "cineflix-7812a.appspot.com",
  messagingSenderId: "99590555897",
  appId: "1:99590555897:web:86711bbc6713e2d4567a28",
  measurementId: "G-2C5QXQV4J3"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjy34SzFABKNaF50DvBLeFHbjCjRqKfBLD0fmolpFBNbYQhdw7DBtadjYpkGheVCObdpH9eqvKlSOVR3usOvgRv_sTLUGs2XeCYf9dBch0Thf_gEOD4BCIHJw5yxoRv_HT_zSic9icIukLddZ2Qktx54sFh7g0o6FjIyflj5KXzlH6ssXOhgptqTP27-v0/s1600/download-removebg-preview.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Minimal Fetch Handler for PWA
self.addEventListener('fetch', (event) => {
  // Just pass through requests.
  // This event listener is required for Chrome to trigger the "Add to Home Screen" prompt.
  // In a real PWA, you might cache static assets here.
  event.respondWith(fetch(event.request));
});
