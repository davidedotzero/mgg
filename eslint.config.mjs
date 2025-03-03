// 📂 ไฟล์: eslint.config.mjs
// ตำแหน่ง: mgg/eslint.config.mjs
// หน้าที่: กำหนดกฎและการตั้งค่า ESLint เพื่อช่วยตรวจสอบคุณภาพโค้ดและป้องกันข้อผิดพลาด
// เหตุผล: ทำให้โค้ดมีมาตรฐานและลดโอกาสเกิดบั๊กโดยอัตโนมัติ 🎯

import { dirname } from "path";
import { fileURLToPath } from "url";
// อธิบาย:
//     dirname: ฟังก์ชันจาก path ใช้เพื่อดึงตำแหน่งของไดเรกทอรีปัจจุบัน
//     fileURLToPath: แปลง URL ของไฟล์ให้เป็นพาธปกติ (ต้องใช้ใน ESM module)
// เหตุผล:
//     เพราะใช้ไฟล์ .mjs ที่เป็น ESM (ECMAScript Module) ซึ่งไม่มี __dirname กับ __filename แบบ CommonJS
//     ต้องใช้ fileURLToPath และ dirname แทน

import { FlatCompat } from "@eslint/eslintrc";
// อธิบาย:
//     นำเข้า FlatCompat จาก @eslint/eslintrc เพื่อใช้กับการตั้งค่าแบบใหม่ (Flat Config)
//     Flat Config: รูปแบบการตั้งค่าใหม่ของ ESLint ที่ไม่ต้องใช้ไฟล์ .eslintrc.js แบบเดิม
// เหตุผล:
//     รองรับฟีเจอร์ใหม่ของ ESLint ที่จะเลิกใช้ .eslintrc.js ในอนาคต
//     ใช้ FlatCompat เพื่อแปลงการตั้งค่าแบบเก่าให้ใช้กับ Flat Config ได้


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// อธิบาย:
//     สร้าง __filename และ __dirname แบบที่ใช้ใน CommonJS
//     import.meta.url: คืนค่า URL ของไฟล์นี้ (เฉพาะ ESM)
//     fileURLToPath: แปลง URL ให้เป็นพาธปกติ
//     dirname: ดึงพาธของไดเรกทอรีที่ไฟล์นี้อยู่
// เหตุผล:
//     ทำให้ใช้งาน __dirname ใน ESM ได้เหมือน CommonJS
//     จำเป็นสำหรับการตั้งค่า ESLint ให้รู้พาธของโปรเจกต์


const compat = new FlatCompat({
  baseDirectory: __dirname,
});
// อธิบาย:
//     สร้างอินสแตนซ์ FlatCompat โดยระบุ baseDirectory เป็นพาธปัจจุบัน (__dirname)
//     baseDirectory: บอก ESLint ว่าให้หาไฟล์ Config จากพาธไหน
// เหตุผล:
//     ให้ ESLint รู้จักพาธที่เก็บไฟล์ Config
//     ทำให้สามารถใช้การตั้งค่าแบบเก่า (.eslintrc.js) ได้ใน Flat Config

const eslintConfig = [...compat.extends("next/core-web-vitals")];
// อธิบาย:
//     สร้างตัวแปร eslintConfig ด้วยการขยายการตั้งค่าจาก next/core-web-vitals
//     next/core-web-vitals: Preset ของ ESLint สำหรับ Next.js ที่ตรวจเข้มข้นเป็นพิเศษ
//     ใช้ compat.extends: เพื่อแปลงการตั้งค่าแบบเก่าให้ใช้กับ Flat Config ได้
// เหตุผล:
//     ทำให้ตรวจสอบโค้ดตามมาตรฐานของ Next.js และ Core Web Vitals ได้
//     ป้องกันบั๊กและเพิ่มประสิทธิภาพของเว็บตามเกณฑ์ของ Google

export default eslintConfig;
// อธิบาย:
//     Export eslintConfig แบบ ESM (ใช้ export default แทน module.exports)
//     ทำให้ ESLint รู้จัก Config นี้เวลารันคำสั่ง npx eslint
// เหตุผล:
//     ใช้ไฟล์ .mjs ซึ่งเป็น ESM ต้องใช้ export default
//     ทำให้ ESLint รู้จัก Config นี้และตรวจสอบโค้ดตามกฎที่ตั้งไว้


// สรุป: สถานะปัจจุบันและอนาคต

//     ปัจจุบัน:
//         รองรับการตรวจโค้ดตามมาตรฐานของ Next.js และ Core Web Vitals
//         ป้องกันบั๊กและช่วยให้โค้ดมีคุณภาพสูงขึ้น

//     อนาคต:
//         อาจเพิ่มกฎ Custom ใน eslintConfig เช่น:
//             ป้องกันการใช้ console.log ในโปรดักชัน
//             บังคับใช้ PropTypes กับ Component
//         รองรับการตรวจสอบโค้ดใน /game/shop, /game/garden และฟีเจอร์ใหม่ ๆ