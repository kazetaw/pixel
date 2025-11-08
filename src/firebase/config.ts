import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyArt_spXYa77jpN76NpUJ9mkdQSdkG_z24",
  authDomain: "pixel-dashboard-87580.firebaseapp.com",
  databaseURL: "https://pixel-dashboard-87580-default-rtdb.firebaseio.com",
  projectId: "pixel-dashboard-87580",
  storageBucket: "pixel-dashboard-87580.firebasestorage.app",
  messagingSenderId: "1033291223547",
  appId: "1:1033291223547:web:0eed034de1682861243b5e",
  measurementId: "G-M97CR23D6M",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const COMPANY_ID = "pixel";
