"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, setPersistence, inMemoryPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        let unsubscribe = () => {};

        setPersistence(auth, inMemoryPersistence)
            .then(() => {
                unsubscribe = onAuthStateChanged(auth, (user) => {
                    setUser(user || null);
                    setLoading(false);
                });
            })
            .catch((err) => {
                console.error("Failed to set auth persistence", err);
                // Fall back to default persistence
                unsubscribe = onAuthStateChanged(auth, (user) => {
                    setUser(user || null);
                    setLoading(false);
                });
            });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        setLoading(true);
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
