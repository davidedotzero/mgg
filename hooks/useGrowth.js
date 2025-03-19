import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

const useGrowth = (plant, setPlant) => {
  if (!plant) return { xp: 0, growthStage: "seedling" };

  const xp = plant.xp || 0;

  // 🎯 กำหนดระดับการเติบโตของต้นไม้
  const growthStage =
    xp >= 100 ? "bonsai" :
    xp >= 60 ? "medium" :
    xp >= 30 ? "small" : "seedling";

  const increaseXP = async (amount) => {
    if (!plant || !plant.id) return;
    
    const newXP = Math.min(xp + amount, 100); // XP สูงสุด 100
    const newGrowthStage =
      newXP >= 100 ? "bonsai" :
      newXP >= 60 ? "medium" :
      newXP >= 30 ? "small" : "seedling";

    try {
      const plantRef = doc(db, "plots", plant.id);
      await updateDoc(plantRef, {
        "plant.xp": newXP,
        "plant.stage": newGrowthStage,
      });

      setPlant((prev) => ({
        ...prev,
        xp: newXP,
        stage: newGrowthStage,
      }));
    } catch (error) {
      console.error("Error updating XP:", error);
    }
  };

  return { xp, growthStage, increaseXP };
};

export default useGrowth;
