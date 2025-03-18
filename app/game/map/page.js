"use client";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import PlotCard from "@/components/plots/PlotCard";
import usePlots from "@/hooks/usePlots";
import useInventory from "@/hooks/useInventory";

const MapPage = () => {
  const { loading, user, plotsLoading } = useAuth();
  const [coins, setCoins] = useState(0);
  
  const { plots, buyPlot } = usePlots([]);
  const { seeds, items, fertilizers } = useInventory(user, setCoins); 

  if (loading || plotsLoading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-[#f5f9f7] flex">
      {/* 🌸 ร้านค้า (Aside ซ้าย) */}
      <aside className="bg-white p-4 border-2 m-4">
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
      <main className="flex-1 bg-white p-6 border-2 m-4">
        <h1 className="text-2xl mb-6 text-left text-green-600">
          GARDEN
        </h1>
        <div className="grid grid-cols-5 gap-4">
          {plots.map((plot) => (
            <PlotCard key={plot.id} plot={plot} />
          ))}
        </div>
      </main>

      {/* 🎒 กระเป๋าเก็บของ (Aside ขวา) */}
      <aside className="w-1/4 bg-white p-4 border-2 m-4">
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
