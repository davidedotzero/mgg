// app/api/testFirebase/route.js
import { NextResponse } from "next/server";
import { db } from "../../../lib/firebaseConfig";  // ใช้พาธตรงแทน @/
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, "test"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
