import React from 'react';

const Room = ({
  roomId,
  roomName,
  temperature,
  humidity,
  airConditioners,
  onRoomPropertyChange,
  onAcPropertyChange,
  showAirConditioners = true
}) => {
  return (
    <div className="mb-8 p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">{roomName} 온습도</h3>
      {/* Temperature and Humidity Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor={`${roomId}-temperature`} className="block text-sm font-medium text-gray-700 mb-1">
            온도 (°C):
          </label>
          <input
            type="number"
            id={`${roomId}-temperature`}
            step="0.1"
            value={temperature || ''}
            onChange={(e) => onRoomPropertyChange(roomId, 'temperature', e.target.value)}
            placeholder="온도 입력"
            className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor={`${roomId}-humidity`} className="block text-sm font-medium text-gray-700 mb-1">
            습도 (%):
          </label>
          <input
            type="number"
            id={`${roomId}-humidity`}
            step="0.1"
            value={humidity || ''}
            onChange={(e) => onRoomPropertyChange(roomId, 'humidity', e.target.value)}
            placeholder="습도 입력"
            className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
      {/* Air Conditioner Controls */}
      {showAirConditioners && airConditioners && airConditioners.length > 0 && (
        <div className="space-y-4">
          {airConditioners.map((ac, index) => (
            <div key={index} className="p-3 border rounded-md bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                에어컨: {ac.location}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label htmlFor={`${roomId}-ac${index}-mode`} className="block text-xs font-medium text-gray-600 mb-1">
                    모드:
                  </label>
                  <select
                    id={`${roomId}-ac${index}-mode`}
                    value={ac.mode || 'off'}
                    onChange={(e) => onAcPropertyChange(index, 'mode', e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="off">꺼짐</option>
                    <option value="cool">냉방</option>
                    <option value="fan">송풍</option>
                    <option value="dry">제습</option>
                    <option value="heat">난방</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`${roomId}-ac${index}-temperature`} className="block text-xs font-medium text-gray-600 mb-1">
                    설정온도 (°C):
                  </label>
                  <input
                    type="number"
                    id={`${roomId}-ac${index}-temperature`}
                    step="1"
                    min="18"
                    max="30"
                    value={ac.temperature || ''}
                    onChange={(e) => onAcPropertyChange(index, 'temperature', e.target.value)}
                    placeholder="온도"
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    disabled={ac.mode === 'off' || ac.mode === 'fan'}
                  />
                </div>
                <div>
                  <label htmlFor={`${roomId}-ac${index}-reservation`} className="block text-xs font-medium text-gray-600 mb-1">
                    예약 시간 (시간):
                  </label>
                  <input
                    type="number"
                    id={`${roomId}-ac${index}-reservation`}
                    step="0.5"
                    min="0"
                    max="24"
                    value={ac.reservation || ''}
                    onChange={(e) => onAcPropertyChange(index, 'reservation', e.target.value)}
                    placeholder="예약 시간"
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    disabled={ac.mode === 'off'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Room;
