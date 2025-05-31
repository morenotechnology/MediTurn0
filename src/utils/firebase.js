// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCJIN90vbVwhxDa184C9W8zaHO_oBxOnDI",
  authDomain: "mediturn-b0349.firebaseapp.com",
  projectId: "mediturn-b0349",
  storageBucket: "mediturn-b0349.firebasestorage.app",
  messagingSenderId: "235693506942",
  appId: "1:235693506942:web:a49b0e99f70bcc76f1332f",
  measurementId: "G-ZB3R875D3V",
  databaseURL: "https://mediturn-b0349-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);