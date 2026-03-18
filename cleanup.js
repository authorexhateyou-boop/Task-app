import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

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

async function cleanup() {
  console.log("Starting cleanup of test data...");

  // Delete test tasks
  const tasksRef = collection(db, "tasks");
  const qTasks = query(tasksRef, where("creatorName", "in", ["tester", "test1", "test", "testuser"]));
  const tasksSnap = await getDocs(qTasks);
  
  console.log(`Found ${tasksSnap.size} tasks to delete.`);
  for (const t of tasksSnap.docs) {
    await deleteDoc(doc(db, "tasks", t.id));
    console.log(`Deleted task: ${t.id} (${t.data().creatorName})`);
  }

  // Delete test users (be careful, but user explicitly asked to "remove the test")
  const usersRef = collection(db, "users");
  const qUsers = query(usersRef, where("username", "in", ["tester", "test1", "test", "testuser"]));
  const usersSnap = await getDocs(qUsers);
  
  console.log(`Found ${usersSnap.size} users to delete.`);
  for (const u of usersSnap.docs) {
    await deleteDoc(doc(db, "users", u.id));
    console.log(`Deleted user: ${u.id} (${u.data().username})`);
  }

  console.log("Cleanup complete.");
  process.exit(0);
}

cleanup().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
