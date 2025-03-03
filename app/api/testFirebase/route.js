// 📂 ไฟล์: testFirebase.js
// ตำแหน่ง: mgg/app/api/testFirebase/route.js
// หน้าที่: สร้าง API Endpoint ใน Next.js เพื่อดึงข้อมูลจาก Firestore
// เหตุผล: ทดสอบการเชื่อมต่อ Firebase และ Firestore รวมถึงดึงข้อมูลแบบ API 🎯

import { NextResponse } from "next/server";
// อธิบาย:
//     นำเข้า NextResponse จาก next/server
//     ใช้สำหรับส่ง Response กลับเมื่อมีการเรียก API
// เหตุผล:
//     NextResponse เป็น API ใหม่ที่ใช้กับ App Router ของ Next.js
//     รองรับทั้ง JSON, Headers และ Status Code
import { db } from "../../../lib/firebaseConfig";  // ใช้พาธตรงแทน @/
// อธิบาย:
//     นำเข้า db (Firestore Instance) จาก firebaseConfig.js
//     ใช้พาธตรง (../../../) แทนการใช้ @/lib/firebaseConfig
// เหตุผล:
//     แก้ปัญหา Module not found เพราะ Path Alias (@/) ยังไม่ทำงาน
//     จะเปลี่ยนกลับมาใช้ @/lib/firebaseConfig เมื่อแก้ Path Alias ได้
import { collection, getDocs } from "firebase/firestore";
// อธิบาย:
//     นำเข้า collection และ getDocs จาก Firebase SDK
//     collection: สร้าง Reference ไปยัง Collection ใน Firestore
//     getDocs: ดึงข้อมูลทุก Document ใน Collection
// เหตุผล:
//     ต้องการดึงข้อมูลทั้งหมดจาก Collection test ใน Firestore
//     ใช้ getDocs เพราะต้องการข้อมูลทุกเอกสารในครั้งเดียว

export async function GET() {
  //   อธิบาย:
  //     สร้างฟังก์ชัน GET แบบ async สำหรับรับ Request GET
  //     ใช้ export เพื่อให้ Next.js รู้จักว่าเป็น API Endpoint
  // เหตุผล:
  //     รูปแบบใหม่ของ App Router ใน Next.js ต้องใช้ export แบบนี้
  //     async ใช้เพื่อรองรับการดึงข้อมูลแบบ Asynchronous จาก Firestore
  try {
    const querySnapshot = await getDocs(collection(db, "test"));
    //     อธิบาย:
    //     await getDocs(): รอจนกว่าจะดึงข้อมูลจาก Collection test ใน Firestore สำเร็จ
    //     querySnapshot: ผลลัพธ์ที่ได้จาก Firestore ซึ่งมีข้อมูลทุก Document
    // เหตุผล:
    //     ใช้ await เพื่อให้มั่นใจว่าข้อมูลถูกดึงมาก่อนจะไปทำขั้นตอนถัดไป
    //     collection(db, "test"): ชี้ไปยัง Collection ชื่อ test ใน Firestore
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // อธิบาย:
    //     querySnapshot.docs: คืนค่าเป็น Array ของ Document แต่ละตัว
    //     .map((doc) => {...}): วนซ้ำเอกสารทุกตัวใน Collection
    //     doc.id: ID ของเอกสารแต่ละตัว
    //     doc.data(): ข้อมูลในเอกสารแต่ละตัว
    // เหตุผล:
    //     ต้องการแปลงข้อมูลเป็น Array ของ Object ที่มี id และข้อมูลในเอกสาร
    //     ทำให้ง่ายต่อการส่งเป็น JSON กลับไปให้ Frontend
    return NextResponse.json(data);
    // อธิบาย:
    //     ส่งข้อมูล data ในรูปแบบ JSON กลับไปที่ Client
    //     ใช้ NextResponse.json() เพื่อสร้าง Response ที่เป็น JSON
    // เหตุผล:
    //     ทำให้ Frontend เรียก API นี้แล้วได้ข้อมูลที่ใช้งานได้ทันที
    //     รองรับ CORS และ Status Code อัตโนมัติ
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // อธิบาย:
  //     catch (error): ดัก Error ที่เกิดจากการดึงข้อมูลหรือเชื่อมต่อ Firestore
  //     console.error(): แสดง Error ใน Terminal เพื่อ Debug
  //     NextResponse.json(): ส่ง Error Message พร้อม Status Code 500 (Internal Server Error)
  // เหตุผล:
  //     ป้องกันโปรแกรมล่มถ้าเกิดปัญหาเชื่อมต่อ Firestore
  //     ให้ Frontend รู้ว่าเกิด Error และแสดงข้อความ Error ได้
}
