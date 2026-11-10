// Scripts for firebase and messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCJRUp-c9_zeqT6RTjrqf81MOZyI53QZqI",
  authDomain: "filmysky-3454b.firebaseapp.com",
  databaseURL: "https://filmysky-3454b-default-rtdb.firebaseio.com",
  projectId: "filmysky-3454b",
  storageBucket: "filmysky-3454b.firebasestorage.app",
  messagingSenderId: "146408648284",
  appId: "1:146408648284:web:b8cb1891a533a24119c099",
  measurementId: "G-GT8CLQYYL4"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'FilmySky';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjy34SzFABKNaF50DvBLeFHbjCjRqKfBLD0fmolpFBNbYQhdw7DBtadjYpkGheVCObdpH9eqvKlSOVR3usOvgRv_sTLUGs2XeCYf9dBch0Thf_gEOD4BCIHJw5yxoRv_a0R-S0vQ5vYQ3YI0mA0Q4h0sE-7wQn9Y4=w1200-h630-p-k-no-nu'
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
