"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import useAuth from "@/hooks/useAuth";

const InventoryPage = () => {
  const { user, loading, userData } = useAuth();
  const [seeds, setSeeds] = useState([]);
  const [items, setItems] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);

  // 🛠️ เมื่อ `userData` โหลดแล้ว ให้อัปเดต `inventory`
  useEffect(() => {
    if (userData?.inventory) {
      setSeeds(userData.inventory.filter((item) => item.type === "seed"));
      setItems(userData.inventory.filter((item) => item.type === "item"));
      setFertilizers(userData.inventory.filter((item) => item.type === "fertilizers"));
    }
  }, [userData]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-blue-100 p-6">
      <h1 className="text-3xl mb-6 text-center text-blue-700">🎒 คลังของคุณ</h1>

      {/* 🌱 หมวดหมู่: เมล็ดพันธุ์ */}
      <div className="mb-6">
        <h2 className="text-2xl mb-4 text-green-700">🌱 เมล็ดพันธุ์</h2>
        {seeds.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {seeds.map((seed) => (
              <div key={seed.id} className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-xl mb-2">{seed.name}</h3>
                <p>จำนวน: {seed.count || 1}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">ไม่มีเมล็ดพันธุ์ในคลัง</p>
        )}
      </div>

      {/* 🌿 หมวดหมู่: ปุ๋ย */}
      <div className="mb-6">
        <h2 className="text-2xl mb-4 text-yellow-700">🌿 ปุ๋ย</h2>
        {fertilizers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {fertilizers.map((fertilizer) => (
              <div key={fertilizer.id} className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-xl mb-2">{fertilizer.name}</h3>
                <p>จำนวน: {fertilizer.count || 1}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">ไม่มีปุ๋ยในคลัง</p>
        )}
      </div>

      {/* 🎒 หมวดหมู่: ไอเทมอื่น ๆ */}
      <div className="mb-6">
        <h2 className="text-2xl mb-4 text-purple-700">🎒 ไอเทมอื่น ๆ</h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-xl mb-2">{item.name}</h3>
                <p>จำนวน: {item.count || 1}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">ไม่มีไอเทมอื่น ๆ ในคลัง</p>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
