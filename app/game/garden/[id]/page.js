"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";
import usePlantActions from "@/hooks/usePlantActions";
import PlantStats from "@/components/PlantStats";

const GardenPage = () => {
  const { user, loading } = useAuth();
  const [plant, setPlant] = useState([]);
  const [coins, setCoins] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const router = useRouter();
  const { id } = useParams();

  // ✅ ใช้ฟังก์ชันจาก usePlantActions
  const {
    waterPlant,
    fertilizePlant,
    prunePlant,
    trainBonsai,
    health,
    xp,
    growthStage,
    waterLevel,
  } = usePlantActions(plant, setPlant);

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

  const isPlotEmpty =
    !plant || !plant.name || !plant.status || plant.planted === false;

  // ✅ ฟังก์ชันปลูกต้นไม้
  const plantSeed = async () => {
    if (!selectedSeed) {
      alert("กรุณาเลือกเมล็ดพันธุ์ก่อน!");
      return;
    }

    try {
      const plotRef = doc(db, "plots", id);
      const userRef = doc(db, "users", user.uid);

      await setDoc(
        plotRef,
        {
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
        },
        { merge: true }
      );

      // ✅ ลบเมล็ดพันธุ์ออกจาก inventory
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const updatedInventory = userData.inventory.filter(
          (item) => item.id !== selectedSeed.id
        );
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

  return (
    <div className="min-h-screen bg-green-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl mb-4 text-[#4caf50]">
          {plant?.name || "ไม่มีต้นไม้"}
        </h1>
        <PlantStats
          health={health}
          xp={xp}
          growthStage={growthStage}
          waterLevel={waterLevel}
        />
        {/* <p className="mb-2">สุขภาพ: {health} ❤️</p>
        <p className="mb-2">ระดับน้ำ: {waterLevel} 💧</p>
        <p className="mb-2">สถานะ: {plant?.status || "ไม่มีข้อมูล"}</p>
        <p className="mb-2">XP: {xp} 🌱</p>
        <p className="mb-2">ระดับการเติบโต: {growthStage} 🎋</p> */}
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
              {inventory.filter((item) => item.type === "seed").length === 0 ? (
                <p className="text-gray-500">ไม่มีเมล็ดพันธุ์ในคลัง</p>
              ) : (
                inventory
                  .filter((item) => item.type === "seed")
                  .map((seed, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSeed(seed)}
                      className={`px-4 py-2 rounded-lg ${
                        selectedSeed?.id === seed.id
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
              className={`px-4 py-2 rounded bg-green-500 text-white ${
                !selectedSeed ? "opacity-50 cursor-not-allowed" : ""
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
