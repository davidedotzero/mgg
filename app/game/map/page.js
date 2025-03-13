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
import PlotCard from "@/components/plots/PlotCard";

const MapPage = () => {
  const { user, loading, userData } = useAuth();
  const [plots, setPlots] = useState([]);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [seeds, setSeeds] = useState([]); // 🌱 เก็บเฉพาะเมล็ดพันธุ์
  const [items, setItems] = useState([]); // 🎒 เก็บเฉพาะสิ่งของ
  const [fertilizers, setFertilizers] = useState([]);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);

  // 🛠️ ดึงข้อมูลแปลงและ Inventory
  useEffect(() => {
    if (userData) {
      setCoins(userData.coins || 0);
      setSeeds(
        userData.inventory?.filter((item) => item.type === "seed") || []
      );
      setItems(
        userData.inventory?.filter((item) => item.type === "item") || []
      );
      setFertilizers(
        userData.inventory?.filter((item) => item.type === "fertilizers") || []
      );
    }
  }, [userData]);
  
  // 🛠️ ฟังก์ชันดึงข้อมูลแปลง
  useEffect(() => {
    if (!user) return;

    const fetchPlots = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "plots"));
        setPlots(
          querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching plots:", error);
      }
    };

    fetchPlots();
  }, [user]);

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
          id: newPlotId,
          owner: user.uid,
          planted: false,
          plant: {
            id: null,
            name: null,
            stage: null,
            status: null,
            xp: 0,
            growthProgress: 0,
            plantedAt: null,
            lastWateredAt: null,
            lastFertilizedAt: null,
            lastPrunedAt: null,
            lastTrainedAt: null,
            health: 100, // ✅ เพิ่มค่าความแข็งแรงของต้นไม้
            waterLevel: 50, // ✅ เพิ่มระดับน้ำของต้นไม้
          },
        });

        setPlots((prevPlots) => [
          ...prevPlots,
          {
            id: newPlotId,
            owner: user.uid,
            planted: false,
            plant: {
              id: null,
              name: null,
              stage: null,
              status: null,
              xp: 0,
              growthProgress: 0,
              plantedAt: null,
              lastWateredAt: null,
              lastFertilizedAt: null,
              lastPrunedAt: null,
              lastTrainedAt: null,
              health: 100,
              waterLevel: 50,
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

    try {
      const plotRef = doc(db, "plots", plot.id);
      await updateDoc(plotRef, {
        planted: true,
        plant: {
          id: selectedSeed.id, // ✅ ใช้ ID ของเมล็ดพันธุ์แทน
          name: selectedSeed.name,
          owner: user.uid,
          status: "growing",
          plantedAt: new Date(),
          stage: "seedling",
          xp: 0,
          growthProgress: 0,
          lastWateredAt: null,
          lastFertilizedAt: null,
          lastPrunedAt: null,
          lastTrainedAt: null,
          health: 100, // ✅ เพิ่มสุขภาพของต้นไม้
          waterLevel: 50, // ✅ เพิ่มระดับน้ำเริ่มต้น
        },
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        inventory: inventory.filter((item) => item.id !== selectedSeed.id),
      });

      alert(`ปลูก ${selectedSeed.name} สำเร็จ! 🌱`);
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

  const updateGrowth = async (plantId, plant) => {
    const plotRef = doc(db, "plots", plantId);
    const now = new Date();
    const lastWateredAt =
      plant.lastWateredAt?.toDate?.() || plant.plantedAt?.toDate?.();

    if (!lastWateredAt) return;

    // 🌱 ถ้าไม่ได้รดน้ำ 1 วัน ลด health ลง
    const hoursSinceWatered = (now - lastWateredAt) / 1000 / 60 / 60;
    let newHealth = plant.health;
    if (hoursSinceWatered >= 24) {
      newHealth = Math.max(plant.health - 10, 0);
    }

    // 📈 เพิ่ม XP และตรวจสอบการเติบโต
    const newXp = plant.xp + 10;
    const newStage =
      newXp >= 100
        ? "bonsai"
        : newXp >= 60
        ? "medium"
        : newXp >= 30
        ? "small"
        : "seedling";

    await updateDoc(plotRef, {
      "plant.xp": newXp,
      "plant.stage": newStage,
      "plant.growthProgress": Math.min(newXp, 100),
      "plant.health": newHealth,
    });

    alert(`ต้นไม้ ${plant.name} โตขึ้น! 🌱`);
  };

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
        <h1 className="text-3xl mb-6 text-center text-green-600">
          🌳 แผนที่สวน 🗺️
        </h1>
        <div className="grid grid-cols-5 gap-4">
          {plots.map((plot) => (

            <PlotCard key={plot.id} plot={plot} />
          ))}

        </div>
      </main>

      {/* 🎒 กระเป๋าเก็บของ (Aside ขวา) */}
      <aside className="w-1/4 bg-white p-4 rounded-lg shadow-lg m-4">
        <h2 className="text-2xl mb-4 text-center text-blue-700">
          🎒 กระเป๋าเก็บของ
        </h2>
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
        <div>
          {fertilizers.map((fertilizers) => (
            <button
              key={fertilizers.id}
              className="w-full mb-2 px-4 py-2 bg-yellow-200 text-yellow-900 rounded-lg shadow"
            >
              {fertilizers.name} ({fertilizers.count || 1})
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default MapPage;
