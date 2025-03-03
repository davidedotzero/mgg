// 📂 ไฟล์: app/dashboard/page.js
// ตำแหน่ง: mgg/app/dashboard/page.js
// หน้าที่: สร้างหน้า Dashboard แสดงข้อมูลผู้ใช้ที่ล็อกอินด้วย Google
// เหตุผล: ให้ผู้ใช้เห็นข้อมูลโปรไฟล์และสามารถล็อกเอาต์ได้ 🎯
"use client"

import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
// อธิบาย:
//     useAuth: Custom Hook ที่ใช้จัดการสถานะผู้ใช้ (เช็คว่าล็อกอินหรือยัง)
//     useRouter: ใช้สำหรับเปลี่ยนหน้าใน App Router (next/navigation)
// เหตุผล:
//     useAuth ช่วยให้รู้ว่าผู้ใช้ล็อกอินอยู่ไหมและใช้ข้อมูลอะไรได้บ้าง
//     useRouter ใช้พาไปหน้า /auth/login ถ้ายังไม่ได้ล็อกอิน

const DashboardPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  // อธิบาย:
  //     สร้าง Component DashboardPage สำหรับหน้าแดชบอร์ด
  //     user: ข้อมูลผู้ใช้ที่ล็อกอิน เช่น displayName, email
  //     loading: สถานะกำลังเช็คว่าล็อกอินอยู่ไหม (true/false)
  //     logout: ฟังก์ชันล็อกเอาต์จาก useAuth
  //     useRouter: ใช้เปลี่ยนหน้าเมื่อไม่ผ่านเงื่อนไข
  // เหตุผล:
  //     ใช้ข้อมูลผู้ใช้ในการแสดงชื่อและอีเมลบนแดชบอร์ด
  //     ใช้ logout ทำให้ผู้ใช้ล็อกเอาต์ได้

  if (loading) return <p>Loading...</p>;
  // อธิบาย:
  //     ถ้ากำลังตรวจสอบสถานะล็อกอิน (loading: true) ให้แสดง Loading...
  //     ป้องกันไม่ให้หน้าโหลดก่อนเช็คสถานะผู้ใช้เสร็จ
  // เหตุผล:
  //     ป้องกันไม่ให้ผู้ใช้เห็นข้อมูลเดิม (Flash) ก่อนเช็คสถานะล็อกอินเสร็จ

  if (!user) {
    router.push("/auth/login");
    return null;
  }
  // อธิบาย:
  //     ถ้า ไม่ได้ล็อกอิน (user: null):
  //         พาไปหน้า /auth/login โดยใช้ router.push
  //         return null: ไม่แสดงอะไรบนหน้า Dashboard
  // เหตุผล:
  //     ป้องกันการเข้าถึงแดชบอร์ดโดยตรงจาก URL โดยไม่ได้ล็อกอิน
  //     บังคับให้ล็อกอินก่อนเสมอ

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl mb-4">Welcome, {user.displayName}!</h1>
      <p className="mb-4">Email: {user.email}</p>
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Logout
      </button>
    </div>
  );
  // อธิบาย:
  //     ถ้าผ่านเงื่อนไขล็อกอิน:
  //         แสดง Welcome, {user.displayName}! ด้วยชื่อผู้ใช้จริง
  //         แสดงอีเมล ({user.email})
  //         ปุ่ม Logout ที่เรียก logout เมื่อกด
  // เหตุผล:
  //     ให้ผู้ใช้เห็นข้อมูลโปรไฟล์ของตัวเองเมื่อเข้ามา
  //     className="...": ใช้ Tailwind CSS ทำให้หน้าสวยและจัดกลางจอ
};

export default DashboardPage;
// อธิบาย:
//     Export DashboardPage เป็น Component แบบ ESM
//     ทำให้ Next.js รู้จักและสามารถเรียกใช้งานใน /dashboard ได้
// เหตุผล:
//     เป็นรูปแบบการ Export มาตรฐานใน App Router ของ Next.js



// 🛠️ อธิบายการทำงานทั้งหมดของไฟล์นี้:
//     ตรวจสอบสถานะล็อกอิน:
//         ถ้ากำลังโหลด (loading: true): แสดง Loading...
//         ถ้าไม่ล็อกอิน (user: null): พาไปหน้า /auth/login
//         ถ้าล็อกอินสำเร็จ: แสดงข้อมูลโปรไฟล์และปุ่ม Logout
//     แสดงข้อมูลผู้ใช้:
//         ชื่อ (user.displayName)
//         อีเมล (user.email)
//     ปุ่ม Logout:
//         เรียกฟังก์ชัน logout จาก useAuth
//         ลบ Token ของผู้ใช้และ Refresh หน้าใหม่