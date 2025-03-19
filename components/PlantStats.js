const PlantStats = ({ health, xp, growthStage, waterLevel }) => {
    return (
      <div className="w-full bg-white border-1 p-4">
        <h2 className="text-xl font-semibold text-center mb-2">🌱 สถานะต้นไม้</h2>
  
        {/* ✅ แถบสุขภาพ */}
        <div className="mb-4">
          <p className="text-sm font-medium">สุขภาพ: {health} ❤️</p>
          <div className="w-full bg-gray-300 h-3 rounded">
            <div
              className={`h-full rounded ${health > 50 ? "bg-green-500" : health > 20 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${health}%` }}
            ></div>
          </div>
        </div>
  
        {/* ✅ แถบระดับน้ำ */}
        <div className="mb-4">
          <p className="text-sm font-medium">ระดับน้ำ: {waterLevel} 💧</p>
          <div className="w-full bg-gray-300 h-3 rounded">
            <div
              className="h-full bg-blue-500 rounded"
              style={{ width: `${waterLevel}%` }}
            ></div>
          </div>
        </div>
  
        {/* ✅ แถบ XP & ระดับการเติบโต */}
        <div>
          <p className="text-sm font-medium">
            XP: {xp} 🌱 | ระดับ: {growthStage}
          </p>
          <div className="w-full bg-gray-300 h-3 rounded">
            <div
              className="h-full bg-purple-500 rounded"
              style={{ width: `${xp}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default PlantStats;
  