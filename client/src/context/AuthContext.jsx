import { toast } from "react-toastify";
import { AuthService } from "../firebase";
import { secureApiCall } from "../utils/api";
import socket from "../utils/socket";

import { createContext, useState, useEffect, useContext } from "react"
const baseURL = import.meta.env.VITE_DEV_ENDPOINT;

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);

    const signin = async(email,password) => {
        await AuthService.signInUser(email,password);
    }

    const logout = async () => {
        await AuthService.signOutUser();
        toast.success("Logout successfully!")
    };

    const signup = async (email,password) => {
        const userCred = await AuthService.createUser(email,password);
        const newUser = userCred.user;
        const displayName = email.split("@")[0];

        await AuthService.updateProfile(newUser, { displayName });

        setUser({ 
          uid: newUser.uid, 
          email, 
          accessToken: newUser.accessToken, 
          displayName 
        });

        //Add user to mongoDB
        try{
          const res = await fetch(`${baseURL}/api/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              uid : newUser.uid,
              email : email,
              displayName : displayName
            }),
          });

        }catch(error){
          console.error("Error saving user to MongoDB:", error);
          toast.error("User created, but failed to save to database.");
        }
    };

    useEffect(() => {
        const unsubscribe = AuthService.onAuthStateChange((firebaseUser) => {
          if (firebaseUser) {
            // Extract only required fields
            const { uid, email, accessToken, displayName } = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              accessToken: firebaseUser.stsTokenManager?.accessToken,
              displayName: firebaseUser.displayName
            };

            setUser({ uid, email, accessToken, displayName });
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      
        return () => unsubscribe();
      }, []);      

    return <AuthContext.Provider value={{ user, signin, logout, signup }}>
        {!loading && children}
    </AuthContext.Provider>

}

export const useAuth = () => useContext(AuthContext);