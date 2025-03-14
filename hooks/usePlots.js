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

const usePlots = () => {
  const { user } = useAuth();
  const [plots, setPlots] = useState([]);
  const [coins, setCoins] = useState([]);

  const [loading, setLoading] = useState(true);

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

  //อัพเดทสถานะต้นไม้
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

  return { plots, loading, buyPlot, plantInPlot };
};

export default usePlots;
