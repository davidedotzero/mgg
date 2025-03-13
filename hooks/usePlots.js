import { useEffect } from "react";
  
  
  // 🛠️ ฟังก์ชันดึงข้อมูลแปลง
  useEffect(() => {
    if (!user) return;

    const fetchPlots = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "plots"));
        setPlots(
          querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching plots:", error);
      }
    };

    fetchPlots();
  }, [user]);
