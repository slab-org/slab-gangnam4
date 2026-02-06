import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Clipboard, ArrowLeft } from 'lucide-react';
import { branchData } from './data';
import Room from './components/Room';

const TemperatureReportPage = () => {
  const [roomData, setRoomData] = useState({});
  const [copiedText, setCopiedText] = useState('');
  const [additionalChecklistNote, setAdditionalChecklistNote] = useState('');

  useEffect(() => {
    const roomConfigs = branchData.room || {};
    const initialRoomState = {};
    Object.keys(roomConfigs).forEach(roomId => {
      const roomConfig = roomConfigs[roomId] || {};
      initialRoomState[roomId] = {
        temperature: roomConfig.temperature || '',
        humidity: roomConfig.humidity || '',
        airConditioners: (roomConfig.airConditioners || []).map(ac => ({
          location: ac.location,
          mode: ac.mode || 'off',
          temperature: ac.temperature || '',
          reservation: ac.reservation || ''
        }))
      };
    });
    setRoomData(initialRoomState);
    setAdditionalChecklistNote('');
    setCopiedText('');
  }, []);

  const handleRoomPropertyChange = (roomId, field, value) => {
    setRoomData(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value
      }
    }));
  };

  const handleAcPropertyChange = (roomId, acIndex, field, value) => {
    setRoomData(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        airConditioners: prev[roomId].airConditioners.map((ac, idx) =>
          idx === acIndex ? { ...ac, [field]: value } : ac
        )
      }
    }));
  };

  const getModeText = (mode) => {
    const modeMap = {
      off: '꺼짐', cool: '냉방', fan: '송풍', dry: '제습', heat: '난방'
    };
    return modeMap[mode] || mode;
  };

  const generateRoomText = (roomId) => {
    const room = roomData[roomId] || {};
    const roomConfig = branchData.room?.[roomId] || {};
    const roomName = roomConfig.name || roomId;

    let text = `${roomName} 온도: ${room.temperature || '-'}°C, 습도: ${room.humidity || '-'}% 입니다.`;

    if (room.airConditioners && room.airConditioners.length > 0) {
      const acTexts = room.airConditioners.map(ac => {
        if (ac.mode === 'off') return null;
        
        let acText = `${ac.location} ${getModeText(ac.mode)}`;
        if (ac.temperature && ac.mode !== 'fan') {
          acText += ` ${ac.temperature}°C`;
        }
        if (ac.reservation) {
          acText += ` (${ac.reservation}시간 예약)`;
        }
        return acText;
      }).filter(Boolean);

      if (acTexts.length > 0) {
        text += `\n에어컨: ${acTexts.join(', ')}`;
      }
    }

    return text;
  };

  const handleCopyButtonClick = () => {
    actuallyCopyText();
  };

  const actuallyCopyText = () => {
    let reportText = `${branchData.name} 입니다.\n\n`;
    
    // 모든 방의 정보를 수집
    const roomConfigs = branchData.room || {};
    Object.keys(roomConfigs).forEach(roomId => {
      const roomText = generateRoomText(roomId);
      if (roomText) {
        reportText += roomText + '\n';
      }
    });

    // 추가 사항이 있으면 추가
    if (additionalChecklistNote && additionalChecklistNote.trim()) {
      reportText += '\n추가 사항:\n' + additionalChecklistNote;
    }

    if (reportText.trim() === `${branchData.name} 입니다.`) {
      alert('복사할 정보가 없습니다. 온습도 정보를 입력해주세요.');
      return;
    }

    navigator.clipboard.writeText(reportText.trim()).then(() => {
      setCopiedText(reportText.trim());
      alert('텍스트가 클립보드에 복사되었습니다!');
    }).catch(err => {
      console.error('클립보드 복사 실패:', err);
      alert('클립보드 복사에 실패했습니다.');
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header branchName={branchData.name} />
      <main className="flex-grow container mx-auto py-6 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{`온도/습도 보고 (${branchData.name})`}</h2>
          <div className="flex justify-end mt-2">
            <Link
              to="/"
              className="flex items-center text-green-700 hover:text-green-900 transition-colors text-sm md:text-base font-medium"
            >
              <ArrowLeft className="mr-2" size={16} />
              홈으로 돌아가기
            </Link>
          </div>
        </div>
        {/* Room Management Section */}
        {Object.entries(branchData.room || {}).map(([roomId, initialRoomConfig]) => {
          const currentRoomState = roomData[roomId] || {};
          return (
            <Room
              key={roomId}
              roomId={roomId}
              roomName={initialRoomConfig.name || roomId}
              temperature={currentRoomState.temperature}
              humidity={currentRoomState.humidity}
              airConditioners={currentRoomState.airConditioners || []}
              onRoomPropertyChange={handleRoomPropertyChange}
              onAcPropertyChange={(acIndex, field, value) => handleAcPropertyChange(roomId, acIndex, field, value)}
              showAirConditioners={false}
            />
          );
        })}
        <div className="mb-6 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">환경 관련 추가 사항</h2>
          <textarea
            value={additionalChecklistNote}
            onChange={(e) => setAdditionalChecklistNote(e.target.value)}
            placeholder="온습도, 에어컨, 체크리스트 관련 특이사항을 입력하세요..."
            className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
            rows="3"
          />
        </div>
        <button
          onClick={handleCopyButtonClick}
          className="w-full bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition duration-300 flex items-center justify-center text-base font-medium shadow active:bg-green-900"
        >
          <Clipboard className="mr-2" size={20} />
          온도/습도 정보 복사하기
        </button>
        {copiedText && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow">
            <h3 className="font-semibold mb-2 text-gray-700">복사된 텍스트:</h3>
            <pre className="whitespace-pre-wrap text-xs bg-white p-3 rounded border border-gray-200 max-h-60 overflow-y-auto">{copiedText}</pre>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TemperatureReportPage;
