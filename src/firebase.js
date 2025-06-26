// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAS3PlhsZLF18ese9LwE05YyJYhf-lWZU",
  authDomain: "money-tracker-fb.firebaseapp.com",
  projectId: "money-tracker-fb",
  storageBucket: "money-tracker-fb.firebasestorage.app",
  messagingSenderId: "308276545482",
  appId: "1:308276545482:web:b8b9dc156507d1fe573133"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app); 