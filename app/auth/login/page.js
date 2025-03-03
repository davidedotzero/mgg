// 📂 ไฟล์: app/auth/login/page.js
// ตำแหน่ง: mgg/app/auth/login/page.js
// หน้าที่: สร้างหน้า Login สำหรับเข้าสู่ระบบด้วย Google Sign-in
// เหตุผล: อนุญาตให้ผู้ใช้ล็อกอินด้วย Google และบันทึกข้อมูลใน Firestore 🎯
"use client"
// อธิบาย:
// บอก Next.js ว่านี่คือ Client Component (รันบนฝั่งผู้ใช้)
// ทำให้ใช้ Hook อย่าง useEffect และ Event Handling ได้
// เหตุผล:
// จำเป็นต้องใช้เพราะมีการเรียก API และจัดการ Event บนฝั่งผู้ใช้
// ใช้ร่วมกับ signInWithPopup ของ Firebase ที่ต้องรันบน Client-side เท่านั้น

import { useEffect } from "react";
import { auth, googleProvider, db } from "@/lib/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
// อธิบาย:
//     useEffect: จัดการ Side Effect (เช่น เช็คสถานะล็อกอิน)
//     auth, googleProvider, db: เชื่อมต่อ Firebase (Auth และ Firestore)
//     signInWithPopup: ฟังก์ชันล็อกอินด้วย Google Popup
//     useRouter: ใช้สำหรับเปลี่ยนหน้าใน App Router (next/navigation)
//     doc, setDoc, getDoc: ฟังก์ชันจัดการข้อมูลใน Firestore
// เหตุผล:
//     เตรียมใช้ Google Login และบันทึกข้อมูลใน /users ของ Firestore
//     ใช้ useRouter แทน useHistory แบบเก่าใน App Router

const LoginPage = () => {
  const router = useRouter();
  //   อธิบาย:
  //   สร้าง Component ชื่อ LoginPage สำหรับหน้าล็อกอิน
  //   ใช้ useRouter สำหรับเปลี่ยนหน้าไป /dashboard หลังล็อกอิน
  // เหตุผล:
  //   แยก Component ทำให้โค้ดอ่านง่ายและจัดการได้สะดวก
  //   ต้องใช้ useRouter เพราะใช้ App Router ของ Next.js


  const handleGoogleLogin = async () => {
    // อธิบาย:
    //     สร้างฟังก์ชัน handleGoogleLogin แบบ async สำหรับจัดการ Google Login
    //     async ทำให้รองรับการใช้ await กับ Firebase Auth ได้
    // เหตุผล:
    //     ต้องใช้ async และ await เพื่อจัดการกระบวนการล็อกอินที่เป็น Asynchronous
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // อธิบาย:
      //     เปิด Popup ให้ผู้ใช้ล็อกอินด้วย Google
      //     result.user: ข้อมูลผู้ใช้ที่ล็อกอินสำเร็จ เช่น UID, Email, Display Name
      // เหตุผล:
      //     ใช้ signInWithPopup เพราะใช้ง่ายและรองรับ Firebase SDK โดยตรง

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      // อธิบาย:
      //     doc(db, "users", user.uid): สร้าง Reference ไปยัง /users/{uid} ใน Firestore
      //     getDoc(userRef): ดึงข้อมูลผู้ใช้จาก Firestore
      // เหตุผล:
      //     ตรวจสอบว่าผู้ใช้มีอยู่ใน Firestore แล้วหรือยัง
      //     ป้องกันการบันทึกข้อมูลซ้ำ

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          createdAt: new Date(),
        });
      }
      // อธิบาย:
      //    - ถ้าไม่มีข้อมูลผู้ใช้ใน Firestore (!userSnap.exists()):
      //        - บันทึกข้อมูลใหม่ใน /users/{uid}
      //        - เก็บ uid, displayName, email และ createdAt

      // เหตุผล:
      //     บันทึกข้อมูลผู้ใช้ใหม่เมื่อเป็นการล็อกอินครั้งแรก
      //     ทำให้สามารถดึงข้อมูลผู้ใช้จาก Firestore ได้ในหน้า /dashboard

      router.push("/dashboard");
      // อธิบาย:
      //     เปลี่ยนหน้าไปที่ /dashboard หลังจากล็อกอินสำเร็จ
      // เหตุผล:
      //     ทำให้ UX ราบรื่นและพาผู้ใช้ไปยังหน้าโปรไฟล์หลังล็อกอิน
    } catch (error) {
      console.error("Login Error:", error);
    }
    // อธิบาย:
    //     ดักจับ Error ที่เกิดขึ้นใน handleGoogleLogin
    //     แสดง Error ใน Console เพื่อช่วย Debug
    // เหตุผล:
    //     ป้องกันโปรแกรมล่มและช่วยระบุปัญหาได้ง่ายขึ้น
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl mb-6">Login to mgg</h1>
      <button
        onClick={handleGoogleLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Login with Google
      </button>
    </div>
  );
  // อธิบาย:
  //     สร้าง UI ของหน้า Login ด้วย Tailwind CSS
  //     onClick={handleGoogleLogin}: เรียกฟังก์ชันล็อกอินเมื่อกดปุ่ม
  //     className="...": ใช้ Tailwind CSS จัดรูปแบบปุ่มและพื้นหลัง
  // เหตุผล:
  //     ใช้ Tailwind CSS เพราะทำให้เขียน UI ได้เร็วและสะอาดตา
  //     ปุ่ม Login with Google เป็นทางเลือกที่ผู้ใช้คุ้นเคย
};

export default LoginPage;
// อธิบาย:
//     Export Component LoginPage เพื่อให้ Next.js รู้จักและเรียกใช้งานได้
// เหตุผล:
//     ใช้ export default เพราะเป็น Client Component ที่ต้องถูก Render ในฝั่ง Client