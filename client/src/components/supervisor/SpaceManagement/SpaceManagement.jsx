import React from 'react';

const SpaceManagement = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        SpaceManagement - Supervisor View
      </h1>
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
        <div>
          <p className="text-gray-600">
            This is the SpaceManagement component for supervisor role.
          </p>
          {/* Add your SpaceManagement content here */}
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Add Space</button>
      </div>
    </div>
  );
};

export default SpaceManagement;
