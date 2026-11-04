import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAl7Zmz8acncA76ODJk9Zkmv7FEDaEzEYo",
  authDomain: "ghana-basic-school-3f56b.firebaseapp.com",
  projectId: "ghana-basic-school-3f56b",
  storageBucket: "ghana-basic-school-3f56b.firebasestorage.app",
  messagingSenderId: "616325271573",
  appId: "1:616325271573:web:ba9f0776edbd49bdd87e1c",
  measurementId: "G-EM2LS35KS9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);