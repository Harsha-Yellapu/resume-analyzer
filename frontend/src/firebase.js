import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDV74ZOB5eS1mBvDvs89xnUADaiIPfO290",
  authDomain: "resume-analyzer-eb792.firebaseapp.com",
  projectId: "resume-analyzer-eb792",
  storageBucket: "resume-analyzer-eb792.firebasestorage.app",
  messagingSenderId: "5916360363",
  appId: "1:5916360363:web:581699b562b18a8a9241ee"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
