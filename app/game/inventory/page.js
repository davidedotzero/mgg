"use client";
import useAuth from "@/hooks/useAuth";
import useInventory from "@/hooks/useInventory";

const InventoryPage = () => {
  const { user, loading } = useAuth();
  const { inventory, useItem } = useInventory(user);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-blue-100 p-6">
      <h1 className="text-3xl mb-6 text-center">คลังของคุณ 🎒</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <div key={item.id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl mb-2">{item.name} ({item.count})</h3>
            <p>ประเภท: {item.type}</p>
            <button
              onClick={() => useItem(item.id)}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow"
            >
              ใช้ไอเทม
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryPage;
