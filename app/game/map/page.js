"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

const MapPage = () => {
  const { user, loading } = useAuth();
  const [plots, setPlots] = useState([]);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [seeds, setSeeds] = useState([]);     // 🌱 เก็บเฉพาะเมล็ดพันธุ์
  const [items, setItems] = useState([]);     // 🎒 เก็บเฉพาะสิ่งของ
  const [coins, setCoins] = useState(0);

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

        await updateDoc(userRef, {
          coins: currentCoins - 20,
        });

        const newPlotId = `plot_00${plots.length + 1}`;
        const plotRef = doc(db, "plots", newPlotId);
        await setDoc(plotRef, {
          planted: false,
          plant: {
            name: "",
            owner: "",
            status: "",
            plantedAt: null,
            stage: "",
            xp: 0,
            growthProgress: 0,
            lastWateredAt: null,
          },
        });

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
              stage: "",
              xp: 0,
              growthProgress: 0,
              lastWateredAt: null,
            },
          },
        ]);

        setCoins(currentCoins - 20);
        alert("ซื้อแปลงใหม่สำเร็จ! 🌱");
      }
    } catch (error) {
      console.error("Error buying plot:", error);
      alert("เกิดข้อผิดพลาดในการซื้อแปลง");
    }
  };

  // 🛠️ ฟังก์ชันปลูกต้นไม้ (เฉพาะเมล็ดพันธุ์)
  const plantInPlot = async (plot) => {
    if (!selectedSeed) return alert("เลือกเมล็ดพันธุ์ก่อน!");
    if (plot.planted) return alert("แปลงนี้มีต้นไม้อยู่แล้ว!");

    if (selectedSeed.type !== "seed") {
      alert("ปลูกได้เฉพาะเมล็ดพันธุ์เท่านั้น! 🌱");
      return;
    }

    try {
      const plotRef = doc(db, "plots", plot.id);
      await updateDoc(plotRef, {
        planted: true,
        plant: {
          name: selectedSeed.name,
          owner: user.uid,
          status: "growing",
          plantedAt: new Date(),
          stage: "seedling",
          xp: 0,
          growthProgress: 0,
          lastWateredAt: null,
        },
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        inventory: inventory.filter((item) => item.id !== selectedSeed.id),
      });

      alert(`ปลูก ${selectedSeed.name} สำเร็จ! 🌱`);
      setSelectedSeed(null);
    } catch (error) {
      console.error("Error planting:", error);
      alert("เกิดข้อผิดพลาดในการปลูกต้นไม้");
    }
  };

  // 🛠️ ดึงข้อมูลแปลงและ Inventory
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
          setInventory(userData.inventory || []);
          setCoins(userData.coins || 0);

          // 🛠️ แยกประเภทเมล็ดพันธุ์และสิ่งของ
          setSeeds(userData.inventory.filter((item) => item.type === "seed"));
          setItems(userData.inventory.filter((item) => item.type === "item"));
        }
      };

      fetchInventory();
      fetchPlots();
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-[#f5f9f7] flex">
      {/* 🌸 ร้านค้า (Aside ซ้าย) */}
      <aside className="w-1/4 bg-white p-4 rounded-lg shadow-lg m-4">
        <h2 className="text-2xl mb-4 text-center text-pink-700">🛒 ร้านค้า</h2>
        <p className="text-center mb-4">💰 Coins: {coins}</p>
        <button
          onClick={buyPlot}
          className="w-full mb-4 px-4 py-2 bg-yellow-400 text-white rounded-lg shadow"
        >
          ซื้อแปลงใหม่ (20 Coins)
        </button>
      </aside>

      {/* 🌳 แปลงปลูกต้นไม้ (ตรงกลาง) */}
      <main className="flex-1 bg-white p-6 rounded-lg shadow-lg m-4">
        <h1 className="text-3xl mb-6 text-center text-green-600">🌳 แผนที่สวน 🗺️</h1>
        <div className="grid grid-cols-5 gap-4">
          {plots.map((plot) => (
            <div
              key={plot.id}
              className={`w-24 h-24 border rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer ${
                plot.planted ? "bg-green-200" : "bg-gray-100"
              }`}
            >
              <span>{plot.planted ? plot.plant.name : "ว่าง"}</span>
              <span className="text-xs text-gray-600">
                {plot.planted && plot.plant.stage}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* 🎒 กระเป๋าเก็บของ (Aside ขวา) */}
      <aside className="w-1/4 bg-white p-4 rounded-lg shadow-lg m-4">
        <h2 className="text-2xl mb-4 text-center text-blue-700">🎒 กระเป๋าเก็บของ</h2>
        <h3 className="text-lg mb-2">🌱 เมล็ดพันธุ์</h3>
        <div className="mb-4">
          {seeds.map((seed) => (
            <button
              key={seed.id}
              className="w-full mb-2 px-4 py-2 bg-green-200 text-green-900 rounded-lg shadow"
            >
              {seed.name}
            </button>
          ))}
        </div>
        <h3 className="text-lg mb-2">🎒 สิ่งของ</h3>
        <div>
          {items.map((item) => (
            <button
              key={item.id}
              className="w-full mb-2 px-4 py-2 bg-yellow-200 text-yellow-900 rounded-lg shadow"
            >
              {item.name} ({item.count || 1})
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default MapPage;
