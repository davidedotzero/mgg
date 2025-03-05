"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

const GardenPage = () => {
  const { user, loading } = useAuth();
  const [plants, setPlants] = useState([]);
  const [coins, setCoins] = useState(0);
  const [aestheticPoints, setAestheticPoints] = useState(0);


  // 🛠️ ฟังก์ชันฝึกทรงบอนไซ
  const trainBonsai = async (plant, difficulty) => {
    const now = new Date();
    const lastTrainedAt = plant.lastTrainedAt && typeof plant.lastTrainedAt.toDate === "function"
        ? plant.lastTrainedAt.toDate()  // ✅ ใช้ .toDate() ได้ถ้าเป็น Timestamp
        : null;

    // 🛠️ เช็กว่าเคยฝึกไปแล้วภายใน 1 ชั่วโมงหรือยัง
    if (lastTrainedAt && (now - lastTrainedAt) / 1000 / 60 < 60) {
      alert("คุณฝึกทรงบอนไซต้นนี้ไปแล้วเมื่อไม่นานมานี้! 🌀⏳");
      return;
    }

    // 🛠️ เช็ก Coins ว่าพอไหม (ต้องมีอย่างน้อย 10 Coins)
    if (coins < 10) {
      alert("เหรียญไม่พอที่จะฝึกทรงบอนไซ! ❌");
      return;
    }

    // 🛠️ ตั้งค่าโอกาสสำเร็จตามระดับความยาก
    const successRate = {
      easy: 0.8,
      medium: 0.6,
      hard: 0.4,
    }[difficulty];

    const isSuccess = Math.random() <= successRate;  // 🎲 สุ่มโอกาสสำเร็จ

    try {
      const plantRef = doc(db, "plots", plant.id);
      const userRef = doc(db, "users", user.uid);

      if (isSuccess) {
        // 🎉 สำเร็จ → เพิ่ม Aesthetic Points
        await updateDoc(userRef, {
          aestheticPoints: aestheticPoints + 10,
        });

        await updateDoc(plantRef, {
          "plant.status": "trained",
          "plant.lastTrainedAt": now,
        });

        alert(`ฝึกทรงบอนไซสำเร็จ! 🌀 +10 Aesthetic Points ⭐`);
        setAestheticPoints((prev) => prev + 10);
      } else {
        // ❌ ล้มเหลว → เสีย Coins 10
        await updateDoc(userRef, {
          coins: coins - 10,
        });

        await updateDoc(plantRef, {
          "plant.status": "failed",
          "plant.lastTrainedAt": now,
        });

        alert(`ฝึกทรงบอนไซล้มเหลว... ❌ -10 Coins 💸`);
        setCoins((prev) => prev - 10);
      }

      // อัปเดตสถานะและเวลาฝึก
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
      alert("เกิดข้อผิดพลาดในการฝึกทรงบอนไซ");
    }
  };

  const prunePlant = async (plant) => {
    const now = new Date();
    const lastPrunedAt = plant.lastPrunedAt?.toDate();

    // 🛠️ เช็กว่าเคยตัดแต่งไปแล้วภายใน 1 ชั่วโมงหรือยัง
    if (lastPrunedAt && (now - lastPrunedAt) / 1000 / 60 < 60) {
      alert("คุณตัดแต่งกิ่งต้นนี้ไปแล้วเมื่อไม่นานมานี้! ✂️⏳");
      return;
    }

    try {
      const plantRef = doc(db, "plots", plant.id);
      const userRef = doc(db, "users", user.uid);

      // เพิ่ม Aesthetic Points
      await updateDoc(userRef, {
        aestheticPoints: aestheticPoints + 5,  // เพิ่ม 5 Aesthetic Points
      });

      // อัปเดตสถานะต้นไม้และเวลา "ตัดแต่งล่าสุด"
      await updateDoc(plantRef, {
        "plant.lastPrunedAt": now,
        "plant.status": "looking good",  // 🛠️ เปลี่ยนสถานะเป็น "ดูดีขึ้น"
      });

      alert(`ตัดแต่งกิ่งต้นไม้ ${plant.name} สำเร็จ! ✂️⭐`);
      setAestheticPoints((prevPoints) => prevPoints + 5);  // อัปเดต Aesthetic Points ใน UI
      setPlants((prevPlants) =>
        prevPlants.map((p) =>
          p.id === plant.id
            ? { ...p, lastPrunedAt: now, status: "looking good" }
            : p
        )
      );
    } catch (error) {
      console.error("Error pruning plant:", error);
      alert("เกิดข้อผิดพลาดในการตัดแต่งกิ่งต้นไม้");
    }
  };

  const fertilizePlant = async (plant) => {
    const now = new Date();
    const lastFertilizedAt = plant.lastFertilizedAt?.toDate();

    if (lastFertilizedAt && (now - lastFertilizedAt) / 1000 / 60 < 60) {
      alert("คุณให้ปุ๋ยต้นนี้ไปแล้วเมื่อไม่นานมานี้! 🌿⏳");
      return;
    }

    if (coins < 5) {
      alert("เหรียญไม่พอที่จะให้ปุ๋ย! ❌");
      return;
    }

    try {
      const plantRef = doc(db, "plots", plant.id);
      const userRef = doc(db, "users", user.uid);

      // หัก Coins และเพิ่ม XP
      await updateDoc(userRef, {
        coins: coins - 5,
        xp: (plant.xp || 0) + 10,
      });
      // อัปเดตสถานะต้นไม้และเวลาให้ปุ๋ยล่าสุด
      await updateDoc(plantRef, {
        "plant.lastFertilizedAt": now,
        "plant.status": "growing faster",  // 🛠️ เปลี่ยนสถานะเป็นโตเร็วขึ้น
      });

      alert(`ให้ปุ๋ยต้นไม้ ${plant.name} สำเร็จ! 🌿`);
      setCoins((prevCoins) => prevCoins - 5);  // อัปเดต Coins ใน UI
      setPlants((prevPlants) =>
        prevPlants.map((p) =>
          p.id === plant.id
            ? { ...p, lastFertilizedAt: now, status: "growing faster" }
            : p
        )
      );
    } catch (error) {
      console.error("Error fertilizing plant:", error);
      alert("เกิดข้อผิดพลาดในการให้ปุ๋ยต้นไม้");
    }
  };

  const waterPlant = async (plant) => {
    const now = new Date();
    const lastWateredAt = plant.lastWateredAt?.toDate();

    // 🛠️ เช็กว่าเคยรดน้ำไปแล้วภายใน 1 ชั่วโมงหรือยัง
    if (lastWateredAt && (now - lastWateredAt) / 1000 / 60 < 60) {
      alert("คุณรดน้ำต้นนี้ไปแล้วเมื่อไม่นานมานี้! 💧⏳");
      return;
    }

    try {
      const plantRef = doc(db, "plots", plant.id);
      await updateDoc(plantRef, {
        "plant.lastWateredAt": now,
        "plant.status": "growing faster", // 🛠️ เปลี่ยนสถานะเป็นโตเร็วขึ้น
      });

      alert(`รดน้ำต้นไม้ ${plant.name} สำเร็จ! 💧`);
      setPlants((prevPlants) =>
        prevPlants.map((p) =>
          p.id === plant.id
            ? { ...p, lastWateredAt: now, status: "growing faster" }
            : p
        )
      );
    } catch (error) {
      console.error("Error watering plant:", error);
      alert("เกิดข้อผิดพลาดในการรดน้ำต้นไม้");
    }
  };

  useEffect(() => {
    if (user) {
      const fetchPlants = async () => {
        const plotsSnapshot = await getDocs(collection(db, "plots"));
        const plantData = plotsSnapshot.docs
          .filter((doc) => doc.data().planted) // 🛠️ ดึงเฉพาะแปลงที่ปลูกแล้ว
          .map((doc) => ({
            id: doc.id,
            ...doc.data().plant, // 🛠️ ดึงข้อมูลใน `plant` Map
          }));
        setPlants(plantData);
        console.log("ต้นไม้ที่ปลูก:", plantData); // 🛠️ Log ดูว่ามีข้อมูลไหม
      };

      const fetchAestheticPoints = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setAestheticPoints(userData.aestheticPoints || 0);  // 🛠️ เซ็ต Aesthetic Points จาก Firestore
        }
      };

      const fetchCoins = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setCoins(userData.coins || 0);  // 🛠️ เซ็ต Coins จาก Firestore
        }
      };

      const fetchUserStats = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setAestheticPoints(userData.aestheticPoints || 0);
          setCoins(userData.coins || 0);
        }
      };

      fetchUserStats();
      fetchAestheticPoints();
      fetchCoins();
      fetchPlants();
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-green-100 p-6">
      <h1 className="text-3xl mb-6 text-center">สวนของฉัน 🌿</h1>
      {plants.length === 0 ? (
        <p className="text-center text-gray-500">ยังไม่มีต้นไม้ในสวนของคุณ!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <div key={plant.id} className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-xl mb-2">{plant.name}</h3>
              <p>สถานะ: {plant.status}</p>
              <p>ปลูกเมื่อ: {new Date(plant.plantedAt.seconds * 1000).toLocaleDateString()}</p>
              <button
                onClick={() => waterPlant(plant)}
                className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
              >
                รดน้ำ 💧
              </button>
              <button
                onClick={() => fertilizePlant(plant)}
                className="px-4 py-2 bg-green-500 text-white rounded mt-2"
              >
                ให้ปุ๋ย 🌿
              </button>
              <button
                onClick={() => prunePlant(plant)}
                className="px-4 py-2 bg-purple-500 text-white rounded mt-2"
              >
                ตัดแต่งกิ่ง ✂️
              </button>
              <button
              onClick={() => trainBonsai(plant, "easy")}
              className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
            >
              ฝึกทรงบอนไซ (ง่าย) 🌀
            </button>
            <button
              onClick={() => trainBonsai(plant, "medium")}
              className="px-4 py-2 bg-orange-500 text-white rounded mt-2"
            >
              ฝึกทรงบอนไซ (ปานกลาง) 🌀
            </button>
            <button
              onClick={() => trainBonsai(plant, "hard")}
              className="px-4 py-2 bg-red-500 text-white rounded mt-2"
            >
              ฝึกทรงบอนไซ (ยาก) 🌀
            </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GardenPage;
