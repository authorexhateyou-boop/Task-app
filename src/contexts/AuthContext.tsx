import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export interface UserData {
  uid: string;
  username: string;
  email: string;
  threadsHandle: string;
  instagramHandle?: string;
  twitterHandle?: string;
  tiktokHandle?: string;
  youtubeHandle?: string;
  twitchHandle?: string;
  niche?: string;
  taskScore: number;
  streak: number;
  profilePic?: string;
  isAdmin?: boolean;
  tasksPosted?: number;
  tasksCompleted?: number;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, userData: null, loading: true, isAdmin: false });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = undefined;
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            const newUserData: UserData = {
              uid: user.uid,
              username: user.email?.split('@')[0] || 'User',
              email: user.email || '',
              threadsHandle: '',
              taskScore: 0,
              streak: 0
            };
            setDoc(userRef, newUserData);
            setUserData(newUserData);
          }
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading, isAdmin: userData?.isAdmin || false }}>
        {!loading && children}
    </AuthContext.Provider>
  );
}
