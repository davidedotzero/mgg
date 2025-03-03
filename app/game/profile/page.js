"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [plantCount, setPlantCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          setProfile(userSnapshot.data());
        }
      };

      const fetchPlants = async () => {
        const querySnapshot = await getDocs(collection(db, "plants"));
        const ownedPlants = querySnapshot.docs.filter(
          (doc) => doc.data().owner === user.uid
        );
        setPlantCount(ownedPlants.length);
      };

      fetchProfile();
      fetchPlants();
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>ไม่มีข้อมูลผู้ใช้</p>;

  return (
    <div className="min-h-screen bg-blue-100 p-6 flex flex-col items-center">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
        <h1 className="text-3xl mb-4 text-center">โปรไฟล์ของฉัน</h1>
        <p className="mb-2"><strong>ชื่อ:</strong> {profile.displayName}</p>
        <p className="mb-2"><strong>อีเมล:</strong> {profile.email}</p>
        <p className="mb-2"><strong>จำนวนเหรียญ:</strong> {profile.coins} Coins</p>
        <p className="mb-2"><strong>จำนวนต้นไม้ที่ปลูก:</strong> {plantCount} ต้น</p>
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
          onClick={() => alert("ฟีเจอร์แก้ไขโปรไฟล์จะมาเร็ว ๆ นี้!")}
        >
          แก้ไขโปรไฟล์
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
