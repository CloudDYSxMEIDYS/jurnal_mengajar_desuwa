// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBciW8QvXXq_r_D4wtS-4Mu3Kt206KslkY",
  authDomain: "focus-app-834ac.firebaseapp.com",
  projectId: "focus-app-834ac",
  storageBucket: "focus-app-834ac.firebasestorage.app",
  messagingSenderId: "884698729411",
  appId: "1:884698729411:web:4ecdfe3a8fb69e93488b76",
  measurementId: "G-BCWGDJTRHW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);