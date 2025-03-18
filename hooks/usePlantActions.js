import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig";
import { doc, getDocs, updateDoc, collection } from "firebase/firestore";
import useHealth from "./useHealth";

const usePlantActions = (user) => {
  const [plants, setPlants] = useState([]);
  const { health, increaseHealth, decreaseHealth } = useHealth(plants);
  const [waterLevel, setWaterLevel] = useState(plants?.waterLevel || 50);

  useEffect(() => {
    if (!user) return;

    const fetchPlants = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "plots"));
        setPlants(
          querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching plants:", error);
      }
    };

    fetchPlants();
  }, [user]);

  // ✅ 1. รดน้ำต้นไม้ 🌱
  const waterPlant = async (plant) => {
    if (!plant || !plant.id) return alert("ไม่พบต้นไม้!");

    const now = new Date();
    const plantRef = doc(db, "plots", plant.id);

    
      let newWaterLevel = Math.min(waterLevel + 20, 100);
      setWaterLevel(newWaterLevel);

      // ⚠️ เช็กว่ารดน้ำมากเกินไปหรือไม่
      if (newWaterLevel > 90) {
        const confirmOverwater = confirm(
          `🌊 ต้นไม้ ${plant.name} อาจได้รับน้ำมากเกินไป! อาจเกิดรากเน่าได้ 🌿\n\nคุณต้องการรดน้ำต่อหรือไม่?`
        );
        if (!confirmOverwater) return;
      }

      // 🛠️ ถ้าน้ำเกิน 120 → ต้นไม้รากเน่าและตาย ❌
      if (newWaterLevel > 120) {
        await decreaseHealth(plantRef, {
          "plant.status": "root rot",
          "plant.waterLevel": 0,
        });

        setPlants((prevPlants) =>
          prevPlants.map((p) =>
            p.id === plant.id ? { ...p, status: "root rot", waterLevel: 0 } : p
          )
        );
        alert(`🌊 ต้นไม้ ${plant.name} ได้รับน้ำมากเกินไป และเกิดรากเน่า! ❌`);
        return;
      }

      try {
        await increaseHealth(plantRef, {
          "plant.lastWateredAt": now,
          "plant.waterLevel": newWaterLevel,
          "plant.status": "hydrated",
        });

        setPlants((prevPlants) =>
          prevPlants.map((p) =>
            p.id === plant.id
              ? {
                ...p,
                lastWateredAt: now,
                waterLevel: newWaterLevel,
                status: "hydrated",health
              }
              : p
          )
        );

        alert(
          `💧 รดน้ำต้นไม้ ${plant.name} สำเร็จ! (ระดับน้ำ: ${newWaterLevel}%)`
        );
      } catch (error) {
        console.error("Error watering plant:", error);
        alert("เกิดข้อผิดพลาดในการรดน้ำต้นไม้ ❌");
      }
    };

    // ✅ 2. ให้ปุ๋ยต้นไม้ 🌿
    const fertilizePlant = async (plant, inventory, setInventory) => {
      if (!plant || !plant.id) return alert("ไม่พบต้นไม้!");

      const now = new Date();
      try {
        const plantRef = doc(db, "plots", plant.id);
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) return alert("ไม่พบข้อมูลผู้ใช้!");

        let updatedInventory = [...inventory];
        const fertilizerIndex = updatedInventory.findIndex(
          (item) => item.type === "fertilizer"
        );

        if (fertilizerIndex === -1) return alert("ไม่มีปุ๋ยในคลัง!");

        // ✅ ลดจำนวนปุ๋ย
        if (updatedInventory[fertilizerIndex].count > 1) {
          updatedInventory[fertilizerIndex].count -= 1;
        } else {
          updatedInventory.splice(fertilizerIndex, 1);
        }

        // ✅ อัปเดต Firestore
        await updateDoc(userRef, { inventory: updatedInventory });
        await updateDoc(plantRef, {
          "plant.lastFertilizedAt": now,
          "plant.status": "fertilized",
          "plant.xp": (plant.xp || 0) + 10,
        });

        setPlants((prevPlants) =>
          prevPlants.map((p) =>
            p.id === plant.id
              ? {
                ...p,
                lastFertilizedAt: now,
                status: "fertilized",
                xp: (p.xp || 0) + 10,
              }
              : p
          )
        );

        setInventory(updatedInventory);
        alert(`ให้ปุ๋ยต้นไม้ ${plant.name} สำเร็จ! 🌿`);
      } catch (error) {
        console.error("Error fertilizing plant:", error);
        alert("เกิดข้อผิดพลาดในการให้ปุ๋ย ❌");
      }
    };

    // ✅ 3. ตัดแต่งกิ่งต้นไม้ ✂️
    const prunePlant = async (plant) => {
      if (!plant || !plant.id) return alert("ไม่พบต้นไม้!");

      const now = new Date();
      try {
        const plantRef = doc(db, "plots", plant.id);
        await updateDoc(plantRef, {
          "plant.lastPrunedAt": now,
          "plant.status": "pruned",
        });

        setPlants((prevPlants) =>
          prevPlants.map((p) =>
            p.id === plant.id ? { ...p, lastPrunedAt: now, status: "pruned" } : p
          )
        );

        alert(`ตัดแต่งกิ่งต้นไม้ ${plant.name} สำเร็จ! ✂️`);
      } catch (error) {
        console.error("Error pruning plant:", error);
        alert("เกิดข้อผิดพลาดในการตัดแต่งกิ่ง ❌");
      }
    };

    // ✅ 4. ฝึกทรงบอนไซ 🌀
    const trainBonsai = async (plant, difficulty) => {
      if (!plant || !plant.id) return alert("ไม่พบต้นไม้!");

      const now = new Date();
      const successRate = { easy: 0.8, medium: 0.6, hard: 0.4 }[difficulty];
      const isSuccess = Math.random() <= successRate;

      try {
        const plantRef = doc(db, "plots", plant.id);
        const userRef = doc(db, "users", user.uid);

        if (isSuccess) {
          await updateDoc(userRef, {
            aestheticPoints: user.aestheticPoints + 10,
          });
          await updateDoc(plantRef, {
            "plant.status": "trained",
            "plant.lastTrainedAt": now,
          });

          alert(`ฝึกทรงบอนไซสำเร็จ! 🌀 +10 Aesthetic Points ⭐`);
          setAestheticPoints((prev) => prev + 10);
        } else {
          await updateDoc(userRef, {
            coins: coins - 10,
          });
          await updateDoc(plantRef, {
            "plant.status": "failed",
            "plant.lastTrainedAt": now,
          });

          alert(`ฝึกทรงบอนไซล้มเหลว ❌`);
          setCoins((prev) => prev - 10);
        }

        setPlants((prevPlants) =>
          prevPlants.map((p) =>
            p.id === plant.id
              ? {
                ...p,
                lastTrainedAt: now,
                status: isSuccess ? "trained" : "failed",
              }
              : p
          )
        );
      } catch (error) {
        console.error("Error training bonsai:", error);
        alert("เกิดข้อผิดพลาดในการฝึกทรงบอนไซ ❌");
      }
    };

    return { plants, waterPlant, fertilizePlant, prunePlant, trainBonsai };
  };

  export default usePlantActions;
