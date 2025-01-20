import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCOPAR-qMSU5C6XNNe5MukQbNyVxTuE-QE",
  authDomain: "pickeat-b6570.firebaseapp.com",
  projectId: "pickeat-b6570",
  storageBucket: "pickeat-b6570.appspot.com",
  messagingSenderId: "344943561927",
  appId: "1:344943561927:web:b4cef74b51403e0ded82e2",
  measurementId: "G-RLR06CQ2JY",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
