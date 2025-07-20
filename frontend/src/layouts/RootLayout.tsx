import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation could go here */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Invoy App</h1>
            {/* Navigation menu could go here */}
          </div>
        </div>
      </header>

      {/* Main content area where pages will be rendered */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
