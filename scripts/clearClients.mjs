import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.projectId) {
  console.error('Missing Firebase environment variables. Cannot clear clients.');
  process.exit(1);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearClients() {
  const snapshot = await getDocs(collection(db, 'clients'));
  console.log(`Found ${snapshot.size} clients to archive/remove.`);

  await Promise.all(
    snapshot.docs.map(async (doc) => {
      await updateDoc(doc.ref, { isArchived: true, status: 'Inactive' });
      console.log(`Archived ${doc.id}`);
    })
  );

  console.log('Done.');
}

clearClients().catch((err) => {
  console.error(err);
  process.exit(1);
});
