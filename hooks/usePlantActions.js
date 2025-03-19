import { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import useHealth from "./useHealth";

const usePlantActions = (plant, setPlant) => {
  const { health, increaseHealth, decreaseHealth } = useHealth(plant);
  const [waterLevel, setWaterLevel] = useState(plant?.waterLevel || 50);

  // ✅ ฟังก์ชันรดน้ำต้นไม้
  const waterPlant = async () => {
    if (!plant || !plant.id) return alert("ไม่พบต้นไม้!");

    const now = new Date();
    const plantRef = doc(db, "plots", plant.id);

    try {
      let newWaterLevel = Math.min(waterLevel + 20, 100);
      setWaterLevel(newWaterLevel);

      if (newWaterLevel > 90) {
        await decreaseHealth(15);
        alert("รดน้ำมากไป! ต้นไม้เริ่มรากเน่า! ⚠️");
      } else {
        await increaseHealth(5); // เพิ่มสุขภาพ 5 ถ้ารดน้ำพอดี
      }

      await updateDoc(plantRef, {
        "plant.lastWateredAt": now,
        "plant.waterLevel": newWaterLevel,
      });

      setPlant((prev) => ({ ...prev, waterLevel: newWaterLevel }));
      alert(`รดน้ำต้นไม้ ${plant.name} สำเร็จ! 💧`);
    } catch (error) {
      console.error("Error watering plant:", error);
    }
  };

  // ✅ ฟังก์ชันให้ปุ๋ย
  const fertilizePlant = async () => {
    if (!plant || !plant.id) return alert("ไม่พบต้นไม้!");

    const now = new Date();
    const plantRef = doc(db, "plots", plant.id);

    try {
      await increaseHealth(10);
      await updateDoc(plantRef, {
        "plant.lastFertilizedAt": now,
      });

      alert(`ให้ปุ๋ยต้นไม้ ${plant.name} สำเร็จ! 🌿`);
    } catch (error) {
      console.error("Error fertilizing plant:", error);
    }
  };

  // ✅ ฟังก์ชันตัดแต่งกิ่ง
  const prunePlant = async () => {
    if (!plant || !plant.id) return alert("ไม่พบต้นไม้!");

    const now = new Date();
    const plantRef = doc(db, "plots", plant.id);

    try {
      await increaseHealth(5);
      await updateDoc(plantRef, {
        "plant.lastPrunedAt": now,
      });

      alert(`ตัดแต่งกิ่งต้นไม้ ${plant.name} สำเร็จ! ✂️`);
    } catch (error) {
      console.error("Error pruning plant:", error);
    }
  };

  // ✅ ฟังก์ชันฝึกทรงบอนไซ
  const trainBonsai = async (difficulty) => {
    if (!plant || !plant.id) return alert("ไม่พบต้นไม้!");

    const now = new Date();
    const plantRef = doc(db, "plots", plant.id);
    const successRate = { easy: 0.8, medium: 0.6, hard: 0.4 }[difficulty];
    const isSuccess = Math.random() <= successRate;

    try {
      if (isSuccess) {
        await increaseHealth(10);
        await updateDoc(plantRef, { "plant.status": "trained" });
        alert(`ฝึกทรงบอนไซสำเร็จ! 🌀`);
      } else {
        await decreaseHealth(5);
        await updateDoc(plantRef, { "plant.status": "failed" });
        alert(`ฝึกทรงบอนไซล้มเหลว... ❌`);
      }
    } catch (error) {
      console.error("Error training bonsai:", error);
    }
  };

  return { plant, waterPlant, fertilizePlant, prunePlant, trainBonsai, health, waterLevel };
};

export default usePlantActions;
