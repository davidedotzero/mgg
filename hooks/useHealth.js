import { useEffect, useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

const useHealth = (plant) => {
  const [health, setHealth] = useState(plant?.health || 100);
  const [waterLevel, setWaterLevel] = useState(plant?.waterLevel || 50);

  // ✅ อัปเดตสุขภาพต้นไม้ใน Firestore
  const updateHealthInDB = async (plantId, newHealth) => {
    try {
      const plantRef = doc(db, "plots", plantId);
      await updateDoc(plantRef, {
        "plant.health": newHealth,
      });
    } catch (error) {
      console.error("Error updating health:", error);
    }
  };

  // ✅ ฟังก์ชันลดสุขภาพต้นไม้
  const decreaseHealth = async (amount) => {
    if (!plant || !plant.id) return;
    const newHealth = Math.max(health - amount, 0);
    setHealth(newHealth);
    await updateHealthInDB(plant.id, newHealth);
  };

  // ✅ ฟังก์ชันเพิ่มสุขภาพต้นไม้
  const increaseHealth = async (amount) => {
    if (!plant || !plant.id) return;
    const newHealth = Math.min(health + amount, 100);
    setHealth(newHealth);
    await updateHealthInDB(plant.id, newHealth);
  };

  // ✅ ตรวจสอบสุขภาพทุก 6 ชั่วโมง
  useEffect(() => {
    if (!plant || !plant.id) return;

    const checkHealth = async () => {
      const plantRef = doc(db, "plots", plant.id);
      const plantSnapshot = await getDoc(plantRef);
      if (!plantSnapshot.exists()) return;

      const plantData = plantSnapshot.data().plant;
      let newHealth = plantData.health;

      // 🌱 ถ้าต้นไม้ขาดน้ำ → ลด 10 health
      if (plantData.waterLevel < 10) {
        newHealth = Math.max(newHealth - 10, 0);
      }

      // 💧 ถ้ารดน้ำมากไป → เสี่ยงรากเน่า ลด 15 health
      if (plantData.waterLevel > 90) {
        newHealth = Math.max(newHealth - 15, 0);
      }

      // ✅ อัปเดต health
      setHealth(newHealth);
      await updateHealthInDB(plant.id, newHealth);
    };

    const interval = setInterval(checkHealth, 6 * 60 * 60 * 1000); // ทุก 6 ชั่วโมง
    return () => clearInterval(interval);
  }, [plant]);

  return { health, decreaseHealth, increaseHealth };
};

export default useHealth;
