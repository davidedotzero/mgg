"use client"
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;

  if (!user) {
    router.push("/auth/login");
    return null;
  }

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
};

export default DashboardPage;
