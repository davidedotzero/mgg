"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,  // 🛠️ ใช้ setDoc แทน updateDoc สำหรับสร้างแปลงใหม่
} from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

const MapPage = () => {
  const { user, loading } = useAuth();
  const [plots, setPlots] = useState([]);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [inventory, setInventory] = useState([]);

  // 🛠️ ฟังก์ชันซื้อแปลงใหม่
  const buyPlot = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const currentCoins = userData.coins || 0;

        if (currentCoins < 20) {
          alert("เหรียญไม่พอที่จะซื้อแปลงใหม่! ❌");
          return;
        }

        // หัก Coins ผู้ใช้
        await updateDoc(userRef, {
          coins: currentCoins - 20,
        });

        // สร้าง Plot ใหม่
        const newPlotId = `plot_00${plots.length + 1}`;
        const plotRef = doc(db, "plots", newPlotId);
        await setDoc(plotRef, {     // 🛠️ ใช้ setDoc สร้างแปลงใหม่
          planted: false,
          plant: {
            name: "",
            owner: "",
            status: "",
            plantedAt: null,
          },
        });

        // อัปเดต UI
        setPlots((prevPlots) => [
          ...prevPlots,
          {
            id: newPlotId,
            planted: false,
            plant: {
              name: "",
              owner: "",
              status: "",
              plantedAt: null,
            },
          },
        ]);

        alert("ซื้อแปลงใหม่สำเร็จ! 🌱");
      } else {
        console.log("ไม่พบข้อมูลผู้ใช้");
      }
    } catch (error) {
      console.error("Error buying plot:", error);
      alert("เกิดข้อผิดพลาดในการซื้อแปลง");
    }
  };

  const plantInPlot = async (plot) => {
    if (!selectedSeed) return alert("เลือกเมล็ดพันธุ์ก่อน!");
    if (plot.planted) return alert("แปลงนี้มีต้นไม้อยู่แล้ว!");

    try {
      const plotRef = doc(db, "plots", plot.id);
      await updateDoc(plotRef, {
        planted: true,
        plant: {
          name: selectedSeed.name,
          owner: user.uid,
          status: "growing",
          plantedAt: new Date(),
        },
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        inventory: inventory.filter((item) => item.id !== selectedSeed.id),
      });

      alert(`ปลูก ${selectedSeed.name} สำเร็จ!`);
      setPlots((prevPlots) =>
        prevPlots.map((p) =>
          p.id === plot.id
            ? { ...p, planted: true, plant: { name: selectedSeed.name } }
            : p
        )
      );
    } catch (error) {
      console.error("Error planting:", error);
      alert("เกิดข้อผิดพลาดในการปลูกต้นไม้");
    }
  };

  useEffect(() => {
    if (user) {
      const fetchPlots = async () => {
        const querySnapshot = await getDocs(collection(db, "plots"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlots(data);
      };

      const fetchInventory = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          if (userData.inventory) {
            setInventory(userData.inventory);
          }
        } else {
          console.log("ไม่พบข้อมูลผู้ใช้");
        }
      };

      fetchInventory();
      fetchPlots();
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-green-100 p-6">
      <div className="mb-6 flex justify-center">
        <button
          onClick={buyPlot}  // 🛠️ ปุ่มซื้อแปลงใหม่
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg mb-4"
        >
          ซื้อแปลงใหม่ (20 Coins)
        </button>
      </div>

      <h2 className="text-2xl mb-4">🌱 เลือกเมล็ดพันธุ์</h2>
      <div className="flex gap-4 mb-6">
        {inventory.map((item, index) => (
          <button
            key={`${item.id}-${index}`}
            onClick={() => setSelectedSeed(item)}
            className={`px-4 py-2 rounded-lg ${
              selectedSeed?.id === item.id
                ? "bg-blue-500 text-white"
                : "bg-white text-black"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <h1 className="text-3xl mb-6 text-center">แผนที่สวน 🗺️</h1>
      <div className="grid grid-cols-5 gap-4">
        {plots.map((plot) => (
          <div
            key={plot.id}
            className={`w-24 h-24 border ${
              plot.planted ? "bg-green-500" : "bg-gray-200"
            } flex items-center justify-center cursor-pointer`}
            onClick={() => plantInPlot(plot)}
          >
            {plot.planted ? plot.plant.name : "ว่าง"}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapPage;
