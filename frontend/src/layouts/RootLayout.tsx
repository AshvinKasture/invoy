import { useAppContext } from "@/context/appContext";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";

export default function RootLayout() {
  const { isLoading, isInitialized } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {isLoading || !isInitialized ? (
          <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <Toaster />
    </div>
  );
}
