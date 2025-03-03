"use client"
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

const ShopPage = () => {
    const [items, setItems] = useState([]);
    const [loadingPurchase, setLoadingPurchase] = useState(false);
    const { user, loading } = useAuth();

    useEffect(() => {
        if (user) {
            const fetchItems = async () => {
                const querySnapshot = await getDocs(collection(db, "shop_items"));
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setItems(data);
            };
            fetchItems();
        }
    }, [user]);

    const handleBuyItem = async (item) => {
        if (loadingPurchase) return // ป้องกันการกดซ้ำ
        setLoadingPurchase(true);

        try {
            const useRef = doc(db, "users", user.uid);
            const userSnapshot = await getDocs(collection(db, "users"));
            const userData = userSnapshot.docs.find((doc) => doc.id === user.uid)?.data();

            if (userData && userData.coins >= item.price) {
                // หักเหรียญและเพิ่มไอเทมใน inventory
                await updateDoc(useRef, {
                    coins: increment(-item.price),
                    inventory: arrayUnion({
                        id: item.id,
                        name: item.name,
                        type: item.type,
                    }),
                });
                alert(`ซื้อ ${item.name} สำเร็จ!`);
            } else {
                alert("เหรียญไม่พอ!");
            }
        } catch (error) {
            console.error("Error buying item:", error);
            alert("เกิดข้อผิดพลาดในการซื้อไอเทม");
        } finally {
            setLoadingPurchase(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl mb-6 text-center">Shop</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="bg-white shadow-md rounded-lg p-4">
                        <h2 className="text-xl mb-2">{item.name}</h2>
                        <p className="mb-2">Price: {item.price} Coins</p>
                        <button
                            onClick={() => handleBuyItem(item)}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                            disabled={loadingPurchase}>
                            {loadingPurchase ? "Processing..." : "Buy"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShopPage;


// อธิบายโค้ด: ระบบซื้อสินค้า
//     handleBuyItem: ฟังก์ชันซื้อสินค้า
//         รับ item (สินค้า) เป็นพารามิเตอร์
//         เช็กเหรียญ (coins) ของผู้ใช้ก่อนซื้อ
//         ถ้าเหรียญพอ:
//             หักเหรียญ: coins: increment(-item.price)
//             เพิ่มไอเทมใน Inventory: inventory: arrayUnion({...})
//             แจ้งเตือน alert ว่าซื้อสำเร็จ
//         ถ้าเหรียญไม่พอ:
//             แจ้งเตือน alert("เหรียญไม่พอ!")
//     loadingPurchase: ป้องกันการกดปุ่มซ้ำ
//         setLoadingPurchase(true): ระหว่างซื้อจะปิดปุ่ม Buy ชั่วคราว
//         ป้องกันการซื้อซ้ำและลดโอกาสเกิดบั๊ก
//     การแสดงปุ่ม Buy:
//         ถ้ากำลังซื้อ (loadingPurchase: true): แสดง Processing...
//         ถ้ายังไม่ซื้อ: แสดง Buy

