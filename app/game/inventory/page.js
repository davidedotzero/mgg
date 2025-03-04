"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

const InventoryPage = () => {
  const { user, loading } = useAuth();
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchInventory = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          if (userData.inventory) {
            setInventory(userData.inventory);
          }
        }
      };

      fetchInventory();
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-blue-100 p-6">
      <h1 className="text-3xl mb-6 text-center">คลังของคุณ 🎒</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {inventory.map((item, index) => (
          <div key={`${item.id}-${index}`} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl mb-2">{item.name}</h3>
            <p>ประเภท: {item.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryPage;
