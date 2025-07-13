import React from 'react';

const Parties: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Parties</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Add Party
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Party management coming soon...</p>
      </div>
    </div>
  );
};

export default Parties;
