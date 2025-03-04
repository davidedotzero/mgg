"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";

const AchievementsPage = () => {
  const { user, loading } = useAuth();
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchAchievements = async () => {
        const querySnapshot = await getDocs(collection(db, "achievements"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAchievements(data);
      };
      fetchAchievements();
    }
  }, [user]);

  const claimAchievement = async (achievement) => {
    try {
      if (!achievement.unlocked) return alert("ยังไม่ปลดล็อก!");

      const achievementRef = doc(db, "achievements", achievement.id);
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        coins: (prev) => prev + achievement.reward,
      });

      await updateDoc(achievementRef, {
        claimed: true,
      });

      alert(`รับรางวัลสำเร็จ! +${achievement.reward} Coins`);
    } catch (error) {
      console.error("Error claiming achievement:", error);
      alert("เกิดข้อผิดพลาดในการรับรางวัล");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-indigo-100 p-6">
      <h1 className="text-3xl mb-6 text-center">Achievements 🏆</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`bg-white shadow-md rounded-lg p-4 ${
              achievement.unlocked ? "" : "opacity-50"
            }`}
          >
            <h3 className="text-xl mb-2">{achievement.description}</h3>
            <p className="mb-2">รางวัล: {achievement.reward} Coins</p>
            <button
              onClick={() => claimAchievement(achievement)}
              className={`px-4 py-2 ${
                achievement.unlocked
                  ? achievement.claimed
                    ? "bg-gray-400"
                    : "bg-green-500"
                  : "bg-red-500"
              } text-white rounded`}
              disabled={!achievement.unlocked || achievement.claimed}
            >
              {achievement.claimed ? "รับแล้ว" : "รับรางวัล"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;
