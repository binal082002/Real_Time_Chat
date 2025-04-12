// Import Firebase from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import firebaseConfig from "./firebase.config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility functions to manage authentication
const AuthService = {
  // Create new user
  createUser: (email, password) => 
    createUserWithEmailAndPassword(auth, email, password),

  // Sign in user
  signInUser: (email, password) => 
    signInWithEmailAndPassword(auth, email, password),

  // Logout user
  signOutUser: () => 
    signOut(auth),

  // Track user state
  onAuthStateChange: (callback) => 
    onAuthStateChanged(auth, callback),

  // Add user to Firestore
  addUserFirestore: async (uid, email) => {
    await setDoc(doc(db, "users", uid), {
      uid,
      email,
      createdAt: new Date(),
    });
  },

  updateProfile: (user, data) => updateProfile(user, data),
  
};

// Export for reuse
export { auth, db, AuthService };
