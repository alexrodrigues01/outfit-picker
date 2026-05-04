import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCu79jREOTYk1rx0ltZAcPz7OaJ6hj2HYs",
  authDomain: "outfit-picker-2e4f1.firebaseapp.com",
  projectId: "outfit-picker-2e4f1",
  storageBucket: "outfit-picker-2e4f1.firebasestorage.app",
  messagingSenderId: "48020072901",
  appId: "1:48020072901:web:15d2ad39c2beca879b43ac",
  measurementId: "G-GVEN8S6X1N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
