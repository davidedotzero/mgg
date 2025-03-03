"use client"

import { useEffect } from "react";
import { auth, googleProvider, db } from "@/lib/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";

const LoginPage = () => {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // ตรวจสอบว่าผู้ใช้มีใน Firestore หรือยัง
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          createdAt: new Date(),
        });
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl mb-6">Login to mgg</h1>
      <button
        onClick={handleGoogleLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Login with Google
      </button>
    </div>
  );
};

export default LoginPage;
