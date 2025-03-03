"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, doc, increment, deleteDoc, getDoc } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

const GardenPage = () => {
    const [seeds, setSeeds] = useState([]);
    const [plants, setPlants] = useState([]);
    const { user, loading } = useAuth();

    useEffect(() => {
        if (user) {
            const fetchInventory = async () => {
                const userRef = doc(db, "users", user.uid);
                const userSnapshot = await getDoc(userRef);
                const userData = userSnapshot.data();

                if (userData && userData.inventory) {
                    setSeeds(userData.inventory);
                } else {
                    setSeeds([]); // ถ้าไม่มีข้อมูล ให้เซ็ตเป็น array ว่าง
                }
            };

            const fetchPlants = async () => {
                const plantsSnapshot = await getDocs(collection(db, "plants"));
                const plantData = plantsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPlants(plantData);
            };

            fetchInventory();
            fetchPlants();
        }
    }, [user]);

    const plantSeed = async (seed) => {
        try {
            const plantRef = await addDoc(collection(db, "plants"), {
                name: seed.name,
                plantedAt: new Date(),
                status: "growing",
                owner: user.uid,
            });

            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                inventory: seeds.filter((item) => item.id !== seed.id),
            });

            alert(`ปลูก ${seed.name} สำเร็จ!`);
        } catch (error) {
            console.error("Error planting seed:", error);
            alert("เกิดข้อผิดพลาดในการปลูกต้นไม้");
        }
    };

    const harvestPlant = async (plant) => {
        try {
            const timeDiff = (new Date() - new Date(plant.plantedAt.toDate())) / 1000 / 60;
            if (timeDiff >= 1) { // ตัวอย่าง: 1 นาที = พร้อมเก็บเกี่ยว
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    coins: increment(100), // เพิ่มเหรียญ 100
                });
                await deleteDoc(doc(db, "plants", plant.id));
                alert(`เก็บเกี่ยว ${plant.name} สำเร็จ! +100 Coins`);
            } else {
                alert("ต้นไม้ยังไม่พร้อมเก็บเกี่ยว!");
            }
        } catch (error) {
            console.error("Error harvesting plant:", error);
            alert("เกิดข้อผิดพลาดในการเก็บเกี่ยว");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="min-h-screen bg-green-100 p-6">
            <h1 className="text-3xl mb-6 text-center">My Garden</h1>

            <h2 className="text-2xl mb-4">🌱 เมล็ดพันธุ์ของคุณ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {seeds.map((seed, index) => (
                    <div key={`${seed.id}-${index}`} className="bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-xl mb-2">{seed.name}</h3>
                        <button
                            onClick={() => plantSeed(seed)}
                            className="px-4 py-2 bg-green-500 text-white rounded"
                        >
                            ปลูก
                        </button>
                    </div>
                ))}
            </div>

            <h2 className="text-2xl mb-4">🌳 ต้นไม้ที่ปลูกอยู่</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plants.map((plant) => (
                    <div key={plant.id} className="bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-xl mb-2">{plant.name}</h3>
                        <p>สถานะ: {plant.status}</p>
                        <button
                            onClick={() => harvestPlant(plant)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded mt-2"
                        >
                            เก็บเกี่ยว
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GardenPage;


// 🛠️ อธิบายโค้ด: ระบบปลูกต้นไม้

//     plantSeed: ฟังก์ชันปลูกต้นไม้
//         สร้าง Document ใหม่ใน plants:
//             name, plantedAt, status, owner (UID ผู้ใช้)
//         ลบเมล็ดออกจาก inventory ของผู้ใช้
//         แจ้งเตือนว่า ปลูกสำเร็จ!

//     harvestPlant: ฟังก์ชันเก็บเกี่ยว
//         เช็กเวลาที่ปลูก (plantedAt):
//             ถ้าเกิน 1 นาที → เก็บเกี่ยวได้ (status: ready)
//         เพิ่มเหรียญ (+100 coins) ใน Firestore
//         ลบข้อมูลต้นไม้หลังเก็บเกี่ยวสำเร็จ
//         แจ้งเตือนว่า เก็บเกี่ยวสำเร็จ!

//     แสดงเมล็ดพันธุ์และต้นไม้:
//         แสดงเมล็ดพันธุ์จาก inventory
//         แสดงต้นไม้ที่ปลูกจาก plants
//         ปุ่ม ปลูก และ เก็บเกี่ยว ใช้ Tailwind CSS จัดสวย