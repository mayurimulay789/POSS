// src/components/dashboard/common/LoadingSkeleton.jsx
import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-100 rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-gray-100 rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-gray-100 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;