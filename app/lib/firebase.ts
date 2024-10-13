import { getAuth as _getAuth } from "@firebase/auth";
// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5UN2L6IqTAmZhGpR9K86skMkyL3Xfshs",
  projectId: "embedding-playground",
  authDomain: "embedding-playground.firebaseapp.com",
};

let _app: FirebaseApp | null = null;

export const getApp = () => {
  if (!_app) {
    _app = initializeApp(firebaseConfig);
  }
  return _app;
};

export const getAuth = () => {
  const auth = _getAuth(getApp());
  auth.useDeviceLanguage();
  return auth;
};

export const getStore = () => getFirestore(getApp());
