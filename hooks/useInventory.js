import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const useInventory = (user, setCoins) => {
  const [inventory, setInventory] = useState([]);
  const [seeds, setSeeds] = useState([]);
  const [items, setItems] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchInventory = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setInventory(userData.inventory || []);
          setCoins(userData.coins || 0);

          // 🎯 แยกประเภทไอเทม
          setSeeds(userData.inventory?.filter((item) => item.type === "seed") || []);
          setItems(userData.inventory?.filter((item) => item.type === "item") || []);
          setFertilizers(userData.inventory?.filter((item) => item.type === "fertilizer") || []);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchInventory();
  }, [user, setCoins]);

  // 🛠️ ฟังก์ชันใช้ไอเทม
  const useItem = async (itemId) => {
    if (!user) return alert("กรุณาเข้าสู่ระบบ!");

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) return alert("ไม่พบข้อมูลผู้ใช้!");

      const userData = userSnapshot.data();
      let updatedInventory = [...userData.inventory];

      // ✅ ค้นหาไอเทมที่ต้องการใช้
      const itemIndex = updatedInventory.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) return alert("ไม่มีไอเทมนี้ในคลัง!");

      // ✅ ใช้ไอเทม 1 ชิ้น
      if (updatedInventory[itemIndex].count > 1) {
        updatedInventory[itemIndex].count -= 1;
      } else {
        updatedInventory.splice(itemIndex, 1);
      }

      // ✅ อัปเดต Firebase
      await updateDoc(userRef, { inventory: updatedInventory });

      // ✅ อัปเดต State
      setInventory(updatedInventory);
      alert("ใช้ไอเทมสำเร็จ! 🎒");
    } catch (error) {
      console.error("Error using item:", error);
      alert("เกิดข้อผิดพลาดในการใช้ไอเทม ❌");
    }
  };

  return { inventory, seeds, items, fertilizers, useItem };
};

export default useInventory;
