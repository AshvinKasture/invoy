import React from 'react';
import { StoreExample } from '@/components/StoreExample';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Sales</h3>
          <p className="text-2xl font-bold text-green-600">₹0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Purchase</h3>
          <p className="text-2xl font-bold text-red-600">₹0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Outstanding</h3>
          <p className="text-2xl font-bold text-yellow-600">₹0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Parties</h3>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
      </div>
      
      {/* Store Usage Example */}
      <div className="mt-8">
        <StoreExample />
      </div>
    </div>
  );
};

export default Dashboard;
