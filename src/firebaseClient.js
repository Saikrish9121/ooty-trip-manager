import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "your-api-key" &&
    firebaseConfig.apiKey.trim() !== ""
  );
};

// Initialize Firebase without fallback
let app, db, storage;

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  storage = getStorage(app);
} else {
  console.error("Firebase is not configured! Please configure your .env file.");
}

export const subscribeToTripData = (callback) => {
  if (!isFirebaseConfigured()) {
    console.error("Firebase is not configured! Please set up your .env file.");
    return () => {}; // return dummy unsubscribe
  }
  const dbRef = ref(db, "ooty-trip-v2");
  const unsubscribe = onValue(dbRef, (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
  return unsubscribe;
};

export const saveTripKey = async (key, value) => {
  if (!isFirebaseConfigured()) {
    console.error("Firebase is not configured! Please set up your .env file.");
    return;
  }
  const cleanKey = key.replace("ooty:", "");
  const dbRef = ref(db, `ooty-trip-v2/${cleanKey}`);
  await set(dbRef, value);
};

export const uploadFileToFirebase = async (file, pathPrefix = "gallery") => {
  if (!file) throw new Error("No file provided");
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured! Please set up your .env file.");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `ooty-media/${pathPrefix}/${fileName}`;
  const sRef = storageRef(storage, filePath);

  await uploadBytes(sRef, file);
  const downloadUrl = await getDownloadURL(sRef);
  return downloadUrl;
};
