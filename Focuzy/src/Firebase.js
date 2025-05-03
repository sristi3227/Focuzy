

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOaeRaXUpbUxn4r7kvvd2dNUth8RoRoV4",
  authDomain: "focustimer-7278e.firebaseapp.com",
  projectId: "focustimer-7278e",
  storageBucket: "focustimer-7278e.firebasestorage.app",
  messagingSenderId: "304659194649",
  appId: "1:304659194649:web:0a587d433e122c1b0d1b88",
  measurementId: "G-8BCZBHS64N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export { db, analytics };