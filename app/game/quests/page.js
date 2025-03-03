"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, updateDoc, doc, increment } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

const QuestsPage = () => {
  const [quests, setQuests] = useState([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchQuests = async () => {
        const querySnapshot = await getDocs(collection(db, "quests"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuests(data);
      };
      fetchQuests();
    }
  }, [user]);

  const claimReward = async (quest) => {
    try {
      const questRef = doc(db, "quests", quest.id);

      if (!quest.completed) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          coins: increment(quest.reward),
        });

        await updateDoc(questRef, {
          completed: true,
        });

        alert(`รับรางวัลสำเร็จ! +${quest.reward} Coins`);
      } else {
        alert("คุณรับรางวัลไปแล้ว!");
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("เกิดข้อผิดพลาดในการรับรางวัล");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-yellow-100 p-6">
      <h1 className="text-3xl mb-6 text-center">Quests</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className={`bg-white shadow-md rounded-lg p-4 ${quest.completed ? "opacity-50" : ""}`}
          >
            <h3 className="text-xl mb-2">{quest.description}</h3>
            <p className="mb-2">รางวัล: {quest.reward} Coins</p>
            <button
              onClick={() => claimReward(quest)}
              className={`px-4 py-2 ${
                quest.completed ? "bg-gray-400" : "bg-green-500"
              } text-white rounded`}
              disabled={quest.completed}
            >
              {quest.completed ? "รับแล้ว" : "รับรางวัล"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestsPage;



// 🛠️ อธิบายโค้ด: ระบบภารกิจ (/game/quests)

//     fetchQuests: ดึงข้อมูลภารกิจจาก Firestore
//         ใช้ getDocs ดึง quests Collection
//         เก็บใน State quests เป็น Array ของภารกิจ

//     claimReward: รับรางวัลเมื่อทำสำเร็จ
//         เช็กว่า completed: false ก่อน:
//             เพิ่มเหรียญ (coins) ให้ผู้ใช้ (+reward)
//             อัปเดต completed: true ใน quests
//             แจ้งเตือนว่า "รับรางวัลสำเร็จ! +[จำนวน] Coins"
//         ถ้า completed: true:
//             แจ้งเตือนว่า "คุณรับรางวัลไปแล้ว!"

//     แสดงปุ่ม รับรางวัล
//         ถ้ารับแล้ว (completed: true):
//             ปุ่มเป็นสีเทา (bg-gray-400) และ disabled
//             แสดง "รับแล้ว"
//         ถ้ายัง (completed: false):
//             ปุ่มเป็นสีเขียว (bg-green-500)
//             แสดง "รับรางวัล"