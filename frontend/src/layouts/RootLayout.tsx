import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main content area where pages will be rendered */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
