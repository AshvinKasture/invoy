import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "../components/Navbar";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
