import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc, collection, query, getDocs, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBUJi8ErwFYg00argt6_vWoOkeoijOoTno",
  authDomain: "task-6ef43.firebaseapp.com",
  projectId: "task-6ef43",
  storageBucket: "task-6ef43.firebasestorage.app",
  messagingSenderId: "481419443926",
  appId: "1:481419443926:web:4dfb5431658fb293141377",
  measurementId: "G-QDKCRFHWYL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function cleanup() {
  try {
    console.log("Attempting to login as test1@example.com...");
    await signInWithEmailAndPassword(auth, "test1@example.com", "test123456");
    console.log("Logged in successfully!");

    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("creatorName", "==", "test1"));
    const snap = await getDocs(q);
    
    console.log(`Found ${snap.size} tasks for test1.`);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, "tasks", d.id));
      console.log(`Deleted task ${d.id}`);
    }
  } catch (e) {
    console.error("Login or delete failed:", e.message);
  }

  process.exit(0);
}

cleanup();
