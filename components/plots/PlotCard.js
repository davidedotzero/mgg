// UI สำหรับแปลง
"use client"
import React from 'react'
import Link from "next/link";

const PlotCard = ({ plot }) => {
  return (
    // <div className={`border rounded-lg ${plot.planted ? "bg-green-200" : "bg-gray-100"}`}>
    //   <span>{plot.planted ? plot.plant.name : "ว่าง"}</span>
    //   <span className="text-xs">{plot.planted && plot.plant.stage}</span>
    // </div>
    <Link
      href={`/game/garden/${plot.id}`}
      key={plot.id}
      className={`w-full h-full border rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer ${
        plot.planted ? "bg-green-200" : "bg-gray-100"
      }`}
    >
      <span className="p-4">{plot.planted ? plot.plant.name : "ว่าง"}</span>
      <span className="p-4">{plot.plant.xp}</span>
      <span className="p-4 text-xs text-gray-600">
        {plot.planted && plot.plant.stage}
      </span>
    </Link>
  );
};

export default PlotCard;
