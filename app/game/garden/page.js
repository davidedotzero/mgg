"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

const GardenPage = () => {
  const { user, loading } = useAuth();
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchPlants = async () => {
        const plotsSnapshot = await getDocs(collection(db, "plots"));
        const plantData = plotsSnapshot.docs
          .filter((doc) => doc.data().planted)  // 🛠️ ดึงเฉพาะแปลงที่ปลูกแล้ว
          .map((doc) => ({
            id: doc.id,
            ...doc.data().plant,  // 🛠️ ดึงข้อมูลใน `plant` Map
          }));
        setPlants(plantData);
        console.log("ต้นไม้ที่ปลูก:", plantData);  // 🛠️ Log ดูว่ามีข้อมูลไหม
      };

      fetchPlants();  // 🛠️ เรียกใช้ฟังก์ชันนี้
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-green-100 p-6">
      <h1 className="text-3xl mb-6 text-center">สวนของฉัน 🌿</h1>
      {plants.length === 0 ? (  // 🛠️ ตรวจสอบถ้าไม่มีต้นไม้
        <p className="text-center text-gray-500">ยังไม่มีต้นไม้ในสวนของคุณ!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <div key={plant.id} className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-xl mb-2">{plant.name}</h3>
              <p>สถานะ: {plant.status}</p>
              <p>ปลูกเมื่อ: {new Date(plant.plantedAt.seconds * 1000).toLocaleDateString()}</p>  {/* 🛠️ แปลง timestamp */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GardenPage;
