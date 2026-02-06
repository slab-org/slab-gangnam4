import React from 'react';

const VersionInfo = ({ date, version, changes }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
    <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 rounded-lg px-3 py-1">
            <span className="text-white font-medium">v{version}</span>
          </div>
          <span className="text-white/90 text-sm">{date}</span>
        </div>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">주요 변경사항</h3>
      <div className="space-y-2">
        {changes.split(',').map((change, index) => (
          <div key={index} className="flex items-start">
            <span className="text-green-700 mr-2">•</span>
            <span className="text-gray-700">{change.trim()}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default VersionInfo;
