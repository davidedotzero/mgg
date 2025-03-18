"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import useAuth from "@/hooks/useAuth";
import usePlantActions from "@/hooks/usePlantActions";

const GardenPage = () => {
  const { user, loading } = useAuth();
  const [plant, setPlant] = useState([]);
  const [coins, setCoins] = useState(0);
  const [aestheticPoints, setAestheticPoints] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const router = useRouter();
  const { id } = useParams();

  // ✅ ใช้ฟังก์ชันจาก usePlantActions
  const { waterPlant, fertilizePlant, prunePlant, trainBonsai } = usePlantActions(user, setPlant, setCoins, setAestheticPoints, setInventory);

  // const useItem = async (itemId) => {
  //   if (!user) {
  //     alert("กรุณาเข้าสู่ระบบ! ❌");
  //     return;
  //   }
  
  //   try {
  //     const userRef = doc(db, "users", user.uid);
  //     const userSnapshot = await getDoc(userRef);
  
  //     if (!userSnapshot.exists()) {
  //       alert("ไม่พบข้อมูลผู้ใช้! ❌");
  //       return;
  //     }
  
  //     const userData = userSnapshot.data();
  //     if (!userData.inventory || userData.inventory.length === 0) {
  //       alert("ไม่มีไอเทมใน inventory! ❌");
  //       return;
  //     }
  
  //     // ค้นหาไอเทมที่ต้องการใช้
  //     const updatedInventory = userData.inventory
  //       .map((invItem) => {
  //         if (invItem.id === itemId) {
  //           const newCount = invItem.count - 1;
  //           return newCount > 0 ? { ...invItem, count: newCount } : null;
  //         }
  //         return invItem;
  //       })
  //       .filter(Boolean); // ลบไอเทมที่ count = 0 ออก
  
  //     // อัปเดต Inventory ใน Firestore
  //     await updateDoc(userRef, { inventory: updatedInventory });
  
  //     alert("ใช้ไอเทมสำเร็จ! 🎒");
  //   } catch (error) {
  //     console.error("Error using item:", error);
  //     alert("เกิดข้อผิดพลาดในการใช้ไอเทม ❌");
  //   }
  // };
  
  useEffect(() => {
    const fetchData = async () => {
      if (user && id) {
        try {
          // 🛠️ ดึงข้อมูลต้นไม้
          const plotRef = doc(db, "plots", id);
          const plotSnapshot = await getDoc(plotRef);
          if (plotSnapshot.exists()) {
            setPlant({ id: plotSnapshot.id, ...plotSnapshot.data().plant });
          } else {
            router.push("/game/map");
            return;
          }

          // 🛠️ ดึงข้อมูลผู้ใช้
          const userRef = doc(db, "users", user.uid);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setCoins(userData.coins || 0);
            setAestheticPoints(userData.aestheticPoints || 0);
            setInventory(userData.inventory || []);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      }
    };

    fetchData();
  }, [user, id, plant]);

  if (loading) return <p>Loading...</p>;

  const isPlotEmpty = !plant || !plant.name || !plant.status || plant.planted === false;

  // ✅ ฟังก์ชันปลูกต้นไม้
  const plantSeed = async () => {
    if (!selectedSeed) {
      alert("กรุณาเลือกเมล็ดพันธุ์ก่อน!");
      return;
    }

    try {
      const plotRef = doc(db, "plots", id);
      const userRef = doc(db, "users", user.uid);

      await setDoc(plotRef, {
        plant: {
          id: id,
          name: selectedSeed.name,
          owner: user.uid,
          status: "growing",
          plantedAt: new Date(),
          stage: "seedling",
          xp: 0,
          growthProgress: 0,
          lastWateredAt: null,
        },
        planted: true,
      }, { merge: true });

      // ✅ ลบเมล็ดพันธุ์ออกจาก inventory
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const updatedInventory = userData.inventory.filter(item => item.id !== selectedSeed.id);
        await updateDoc(userRef, { inventory: updatedInventory });
      }

      // ✅ ดึงข้อมูลต้นไม้ใหม่จาก Firestore (แก้ปัญหาปุ่มไม่ขึ้น)
      const updatedPlot = await getDoc(plotRef);
      if (updatedPlot.exists()) {
        setPlant({ id: updatedPlot.id, ...updatedPlot.data().plant });
      }

      alert(`ปลูก ${selectedSeed.name} สำเร็จ! 🌱`);
      setSelectedSeed(null);
    } catch (error) {
      console.error("Error planting seed:", error);
      alert("เกิดข้อผิดพลาดในการปลูกต้นไม้");
    }
  };

  // const waterPlant = async (plant) => {
  //   if (!plant || !plant.id) {  // ✅ ตรวจสอบว่า plant มีค่าก่อน
  //     console.error("Plant is undefined or missing id:", plant);  // ✅ Log Error
  //     alert("ไม่พบต้นไม้ที่จะรดน้ำ! ❌");
  //     return;
  //   }

  //   const now = new Date();
  //   const lastWateredAt = plant.lastWateredAt?.toDate();

  //   // 🛠️ เช็กว่าเคยรดน้ำไปแล้วภายใน 1 ชั่วโมงหรือยัง
  //   if (lastWateredAt && (now - lastWateredAt) / 1000 / 60 < 60) {
  //     alert("คุณรดน้ำต้นนี้ไปแล้วเมื่อไม่นานมานี้! 💧⏳");
  //     return;
  //   }

  //   try {
  //     const plantRef = doc(db, "plots", plant.id);  // ✅ plant.id จะไม่เป็น undefined
  //     await updateDoc(plantRef, {
  //       "plant.lastWateredAt": now,
  //       "plant.status": "growing faster",
  //     });

  //     alert(`รดน้ำต้นไม้ ${plant.name} สำเร็จ! 💧`);
  //     setPlant({ ...plant, lastWateredAt: now, status: "growing faster" });
  //   } catch (error) {
  //     console.error("Error watering plant:", error);
  //     alert("เกิดข้อผิดพลาดในการรดน้ำต้นไม้");
  //   }
  // };

  // const fertilizePlant = async (plant) => {
  //   if (!plant || !plant.id) {
  //     alert("ไม่พบต้นไม้ที่ต้องการให้ปุ๋ย! ❌");
  //     return;
  //   }
  
  //   const now = new Date();
  //   const lastFertilizedAt = plant.lastFertilizedAt?.toDate();
  
  //   // 🛠️ ป้องกันการให้ปุ๋ยซ้ำภายใน 1 ชั่วโมง
  //   if (lastFertilizedAt && (now - lastFertilizedAt) / 1000 / 60 < 60) {
  //     alert("คุณให้ปุ๋ยต้นนี้ไปแล้วเมื่อไม่นานมานี้! 🌿⏳");
  //     return;
  //   }
  
  //   if (coins < 5) {
  //     alert("เหรียญไม่พอที่จะให้ปุ๋ย! ❌");
  //     return;
  //   }
  
  //   try {
  //     const plantRef = doc(db, "plots", plant.id);
  //     const userRef = doc(db, "users", user.uid);
  //     const userSnapshot = await getDoc(userRef);
  
  //     if (!userSnapshot.exists()) {
  //       alert("ไม่พบข้อมูลผู้ใช้! ❌");
  //       return;
  //     }
  
  //     const userData = userSnapshot.data();
  //     let updatedInventory = userData.inventory || [];
  
  //     // ✅ ค้นหาไอเทมปุ๋ยใน inventory
  //     const fertilizerIndex = updatedInventory.findIndex(
  //       (item) => item.type === "fertilizer"
  //     );
  
  //     if (fertilizerIndex === -1) {
  //       alert("คุณไม่มีปุ๋ยใน Inventory! ❌");
  //       return;
  //     }
  
  //     // ✅ ลดจำนวนปุ๋ย 1 อัน หรือ ลบออกถ้าหมด
  //     if (updatedInventory[fertilizerIndex].count > 1) {
  //       updatedInventory[fertilizerIndex].count -= 1;
  //     } else {
  //       updatedInventory.splice(fertilizerIndex, 1);
  //     }
  
  //     // ✅ อัปเดต Firestore: หัก Coins และลดปุ๋ย
  //     await updateDoc(userRef, {
  //       coins: coins - 5,
  //       xp: (plant.xp || 0) + 10,
  //       inventory: updatedInventory, // ✅ อัปเดต Inventory
  //     });
  
  //     // ✅ อัปเดตสถานะต้นไม้
  //     await updateDoc(plantRef, {
  //       "plant.lastFertilizedAt": now,
  //       "plant.status": "growing faster",
  //     });
  
  //     alert(`ให้ปุ๋ยต้นไม้ ${plant.name} สำเร็จ! 🌿`);
  //     setCoins((prevCoins) => prevCoins - 5);
  //     setPlant({ ...plant, lastFertilizedAt: now, status: "growing faster" });
  
  //     // ✅ อัปเดต Inventory บน UI
  //     setInventory(updatedInventory);
  //   } catch (error) {
  //     console.error("Error fertilizing plant:", error);
  //     alert("เกิดข้อผิดพลาดในการให้ปุ๋ยต้นไม้ ❌");
  //   }
  // };
  

  // const prunePlant = async (plant) => {
  //   const now = new Date();
  //   const lastPrunedAt = plant.lastPrunedAt?.toDate();

  //   // 🛠️ เช็กว่าเคยตัดแต่งไปแล้วภายใน 1 ชั่วโมงหรือยัง
  //   if (lastPrunedAt && (now - lastPrunedAt) / 1000 / 60 < 60) {
  //     alert("คุณตัดแต่งกิ่งต้นนี้ไปแล้วเมื่อไม่นานมานี้! ✂️⏳");
  //     return;
  //   }

  //   try {
  //     const plantRef = doc(db, "plots", plant.id);
  //     const userRef = doc(db, "users", user.uid);

  //     // เพิ่ม Aesthetic Points
  //     await updateDoc(userRef, {
  //       aestheticPoints: aestheticPoints + 5, // เพิ่ม 5 Aesthetic Points
  //     });

  //     // อัปเดตสถานะต้นไม้และเวลา "ตัดแต่งล่าสุด"
  //     await updateDoc(plantRef, {
  //       "plant.lastPrunedAt": now,
  //       "plant.status": "looking good", // 🛠️ เปลี่ยนสถานะเป็น "ดูดีขึ้น"
  //     });

  //     alert(`ตัดแต่งกิ่งต้นไม้ ${plant.name} สำเร็จ! ✂️⭐`);
  //     setAestheticPoints((prevPoints) => prevPoints + 5); // อัปเดต Aesthetic Points ใน UI
  //     setPlant({ ...plant, lastPrunedAt: now, status: "looking good" });
  //   } catch (error) {
  //     console.error("Error pruning plant:", error);
  //     alert("เกิดข้อผิดพลาดในการตัดแต่งกิ่งต้นไม้");
  //   }
  // };

  // // 🛠️ ฟังก์ชันฝึกทรงบอนไซ
  // const trainBonsai = async (plant, difficulty) => {
  //   const now = new Date();
  //   const lastTrainedAt =
  //     plant.lastTrainedAt && typeof plant.lastTrainedAt.toDate === "function"
  //       ? plant.lastTrainedAt.toDate() // ✅ ใช้ .toDate() ได้ถ้าเป็น Timestamp
  //       : null;

  //   // 🛠️ เช็กว่าเคยฝึกไปแล้วภายใน 1 ชั่วโมงหรือยัง
  //   if (lastTrainedAt && (now - lastTrainedAt) / 1000 / 60 < 60) {
  //     alert("คุณฝึกทรงบอนไซต้นนี้ไปแล้วเมื่อไม่นานมานี้! 🌀⏳");
  //     return;
  //   }

  //   // 🛠️ เช็ก Coins ว่าพอไหม (ต้องมีอย่างน้อย 10 Coins)
  //   if (coins < 10) {
  //     alert("เหรียญไม่พอที่จะฝึกทรงบอนไซ! ❌");
  //     return;
  //   }

  //   // 🛠️ ตั้งค่าโอกาสสำเร็จตามระดับความยาก
  //   const successRate = {
  //     easy: 0.8,
  //     medium: 0.6,
  //     hard: 0.4,
  //   }[difficulty];

  //   const isSuccess = Math.random() <= successRate; // 🎲 สุ่มโอกาสสำเร็จ

  //   try {
  //     const plantRef = doc(db, "plots", plant.id);
  //     const userRef = doc(db, "users", user.uid);

  //     if (isSuccess) {
  //       // 🎉 สำเร็จ → เพิ่ม Aesthetic Points
  //       await updateDoc(userRef, {
  //         aestheticPoints: aestheticPoints + 10,
  //       });

  //       await updateDoc(plantRef, {
  //         "plant.status": "trained",
  //         "plant.lastTrainedAt": now,
  //       });

  //       alert(`ฝึกทรงบอนไซสำเร็จ! 🌀 +10 Aesthetic Points ⭐`);
  //       setAestheticPoints((prev) => prev + 10);
  //     } else {
  //       // ❌ ล้มเหลว → เสีย Coins 10
  //       await updateDoc(userRef, {
  //         coins: coins - 10,
  //       });

  //       await updateDoc(plantRef, {
  //         "plant.status": "failed",
  //         "plant.lastTrainedAt": now,
  //       });

  //       alert(`ฝึกทรงบอนไซล้มเหลว... ❌ -10 Coins 💸`);
  //       setCoins((prev) => prev - 10);
  //     }

  //     // อัปเดตสถานะและเวลาฝึก
  //     setPlant((prevPlant) => ({
  //       ...prevPlant,
  //       lastTrainedAt: now,
  //       status: isSuccess ? "trained" : "failed",
  //     }));

  //   } catch (error) {
  //     console.error("Error training bonsai:", error);
  //     alert("เกิดข้อผิดพลาดในการฝึกทรงบอนไซ");
  //   }
  // };

  return (
    <div className="min-h-screen bg-green-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl mb-4 text-[#4caf50]">
          {plant?.name || "ไม่มีต้นไม้"}
        </h1>
        <p className="mb-2">สถานะ: {plant?.status || "ไม่มีข้อมูล"}</p>
        <p className="mb-2">ระดับ: {plant?.stage || "ยังไม่เติบโต"}</p>
        <p className="mb-4">
          ปลูกเมื่อ:{" "}
          {plant?.plantedAt
            ? new Date(plant.plantedAt.seconds * 1000).toLocaleDateString()
            : "ยังไม่ได้ปลูก"}
        </p>

        {isPlotEmpty ? (
          <>
            <p className="text-red-500 mb-4">⚠️ ยังไม่มีต้นไม้ปลูกในแปลงนี้!</p>
            <h2 className="text-xl mb-2">เลือกเมล็ดพันธุ์ 🌱</h2>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {inventory.filter(item => item.type === "seed").length === 0 ? (
                <p className="text-gray-500">ไม่มีเมล็ดพันธุ์ในคลัง</p>
              ) : (
                inventory
                  .filter(item => item.type === "seed")
                  .map((seed, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSeed(seed)}
                      className={`px-4 py-2 rounded-lg ${selectedSeed?.id === seed.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                        }`}
                    >
                      {seed.name}
                    </button>
                  ))
              )}
            </div>

            <button
              onClick={plantSeed}
              className={`px-4 py-2 rounded bg-green-500 text-white ${!selectedSeed ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={!selectedSeed}
            >
              ปลูกต้นไม้ 🌱
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => waterPlant(plant)}
              className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
              disabled={isPlotEmpty}
            >
              รดน้ำ 💧
            </button>

            <button
              onClick={() => fertilizePlant(plant)}
              className="px-4 py-2 bg-green-500 text-white rounded mt-2"
              disabled={isPlotEmpty}
            >
              ให้ปุ๋ย 🌿
            </button>

            <button
              onClick={() => prunePlant(plant)}
              className="px-4 py-2 bg-purple-500 text-white rounded mt-2"
              disabled={isPlotEmpty}
            >
              ตัดแต่งกิ่ง ✂️
            </button>

            <button
              onClick={() => trainBonsai(plant, "easy")}
              className="px-4 py-2 bg-red-500 text-white rounded mt-2"
              disabled={isPlotEmpty}
            >
              ฝึกทรงบอนไซ 🌀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GardenPage;
