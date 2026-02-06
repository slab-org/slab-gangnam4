import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Clipboard, Plus, Minus, ArrowLeft, Search, X } from 'lucide-react';
import { branchData } from './data';
import Room from './components/Room';

const UtilPage = () => {
  const [inventory, setInventory] = useState({});
  const [roomData, setRoomData] = useState({});
  const [checklist, setChecklist] = useState({});
  const [additionalNote, setAdditionalNote] = useState('');
  const [copiedText, setCopiedText] = useState('');
  const [additionalChecklistNote, setAdditionalChecklistNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const currentInventoryItems = branchData.inventory || [];
    const initialInventory = currentInventoryItems.reduce((acc, item) => {
      acc[item.id] = { quantity: -1 };
      return acc;
    }, {});
    setInventory(initialInventory);

    const currentBranchRoomConfigs = branchData.room || {};
    const initialRoomState = {};
    Object.keys(currentBranchRoomConfigs).forEach(roomId => {
      const roomConfig = currentBranchRoomConfigs[roomId] || {};
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

    const initialChecklistState = {};
    const currentChecklistItems = branchData.checklist || {};
    Object.keys(currentChecklistItems).forEach(key => {
      initialChecklistState[key] = false;
    });
    setChecklist(initialChecklistState);

    setAdditionalNote('');
    setAdditionalChecklistNote('');
    setCopiedText('');
  }, []);

  const handleQuantityChange = (id, change) => {
    setInventory(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: Math.max(-1, (prev[id]?.quantity || 0) + change)
      }
    }));
  };

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

  const handleChecklistChange = (itemKey) => {
    setChecklist(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const generateInventoryText = () => {
    const currentInventoryItems = branchData.inventory || [];
    if (!inventory || Object.keys(inventory).length === 0) return '';

    const checkedItems = currentInventoryItems.filter(item => inventory[item.id] && inventory[item.id].quantity >= 0);
    if (checkedItems.length === 0) return '재고 특이사항 없음.\n';

    const text = checkedItems
      .map(item => `${item.name}: ${inventory[item.id].quantity}개`)
      .join('\n');
    return `현재 재고 현황:\n${text}\n`;
  };

  const getModeText = (mode) => {
    const modeMap = {
      off: '꺼짐', cool: '냉방', fan: '송풍', dry: '제습', heat: '난방'
    };
    return modeMap[mode] || mode;
  };

  const generateRoomText = () => {
    let text = '';
    const currentBranchRoomConfigs = branchData.room || {};
    Object.keys(currentBranchRoomConfigs).forEach(roomId => {
      const roomConfig = currentBranchRoomConfigs[roomId];
      const currentRoomState = roomData[roomId] || {};
      if (!currentRoomState) return;
      const roomName = roomConfig.name || roomId;
      if (currentRoomState.temperature && currentRoomState.humidity) {
        text += `\n${roomName} 온도 ${currentRoomState.temperature}℃, 습도 ${currentRoomState.humidity}% 입니다.\n`;
      } else if (currentRoomState.temperature) {
        text += `\n${roomName} 온도 ${currentRoomState.temperature}℃ 입니다.\n`;
      } else if (currentRoomState.humidity) {
        text += `\n${roomName} 습도 ${currentRoomState.humidity}% 입니다.\n`;
      }
      (currentRoomState.airConditioners || []).forEach(ac => {
        if (ac.mode && ac.mode !== 'off') {
          text += `- ${roomName} ${ac.location} 에어컨: ${getModeText(ac.mode)}`;
          if (ac.temperature) {
            text += `, ${ac.temperature}℃`;
          }
          if (ac.reservation) {
            text += `, ${ac.reservation}시간 예약`;
          }
          text += '\n';
        }
      });
    });

    const currentChecklistItems = branchData.checklist || {};
    let checklistCompletedText = '';
    Object.entries(currentChecklistItems).forEach(([key, item]) => {
      if (checklist[key]) {
        checklistCompletedText += `\n- ${item.name} 완료`;
      }
    });
    if (checklistCompletedText) text += checklistCompletedText;

    if (additionalChecklistNote && additionalChecklistNote.trim()) {
      text += '\n추가 사항:\n' + additionalChecklistNote;
    }

    return text.trim() ? text.trim() + '\n' : '';
  };

  const handleCopyButtonClick = () => {
    let reportText = `${branchData.name} 입니다.\n\n`;
    const invText = generateInventoryText();
    if (invText.trim() !== '재고 특이사항 없습니다.') {
      reportText += invText;
    } else if (!additionalNote.trim()) {
      reportText += '재고 특이사항 없습니다.\n';
    }
    if (additionalNote.trim()) {
      reportText += '\n재고 관련 추가 사항:\n' + additionalNote + '\n';
    }

    const roomReportText = generateRoomText();
    if (roomReportText.trim()) {
      reportText += '\n' + roomReportText;
    }
    if (reportText.trim() === `${branchData.name} 입니다.`) {
      alert('복사할 정보가 없습니다. 재고나 환경 정보를 입력해주세요.');
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

  const getItemColor = (quantity) => {
    if (quantity === -1) return 'text-gray-400';
    if (quantity === 0) return 'text-red-500';
    return 'text-black';
  };

  const filteredItems = (branchData.inventory || []).filter(item =>
    searchQuery && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSetQuantity = (id, value) => {
    const numValue = parseInt(value, 10);
    setInventory(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: isNaN(numValue) ? -1 : Math.max(-1, numValue)
      }
    }));
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchQuery('');
  };

  const handleCloseQuickEdit = () => {
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto py-6 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{`종합 유틸리티 (${branchData.name})`}</h2>
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

        <div className="mb-8 bg-green-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-700">안내사항 및 사용법</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>빠른 재고 검색: 물품명을 검색하면 해당 항목이 추천되고, 클릭하면 바로 수량을 수정할 수 있습니다.</li>
            <li>재고 관리: 각 물품의 수량을 조절하세요. '-' 버튼으로 0까지 줄일 수 있고, 그 이하는 '충분'으로 표시됩니다.</li>
            <li>환경 정보: 각 구역의 현재 온도와 습도를 입력하고, 에어컨 설정을 선택하세요.</li>
            <li>추가 체크리스트: 해당하는 항목을 체크하세요.</li>
            <li>"모든 정보 복사하기" 버튼으로 입력된 내용을 클립보드에 복사하여 보고서 등에 활용하세요.</li>
          </ul>
        </div>

        <div className="mb-4 p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">빠른 재고 검색</h2>
          <div className="relative">
            <div className="flex items-center border rounded-lg bg-white">
              <Search className="ml-3 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="물품명을 검색하세요..."
                className="w-full px-3 py-2 rounded-lg focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="mr-3 text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              )}
            </div>
            {filteredItems.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="w-full px-4 py-3 text-left hover:bg-green-50 flex justify-between items-center border-b last:border-b-0"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className={`text-sm ${getItemColor(inventory[item.id]?.quantity)}`}>
                      {inventory[item.id]?.quantity === -1 ? '충분' : `${inventory[item.id]?.quantity}개`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedItem && (
            <div className="mt-4 p-4 bg-white border-2 border-green-500 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                <button onClick={handleCloseQuickEdit} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleQuantityChange(selectedItem.id, -1)}
                  className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-red-600 disabled:bg-gray-300"
                  disabled={inventory[selectedItem.id]?.quantity === -1}
                >
                  <Minus size={24} />
                </button>
                <input
                  type="number"
                  value={inventory[selectedItem.id]?.quantity === -1 ? '' : inventory[selectedItem.id]?.quantity}
                  onChange={(e) => handleSetQuantity(selectedItem.id, e.target.value)}
                  placeholder="충분"
                  className="w-20 text-center text-2xl font-bold border-2 rounded-lg py-2"
                />
                <button
                  onClick={() => handleQuantityChange(selectedItem.id, 1)}
                  className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-green-700"
                >
                  <Plus size={24} />
                </button>
              </div>
              <div className="flex justify-center gap-2 mt-3">
                <button
                  onClick={() => handleSetQuantity(selectedItem.id, 0)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  0개
                </button>
                <button
                  onClick={() => handleSetQuantity(selectedItem.id, -1)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  충분
                </button>
                <button
                  onClick={() => handleSetQuantity(selectedItem.id, 1)}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  1개
                </button>
                <button
                  onClick={() => handleSetQuantity(selectedItem.id, 5)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  5개
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">물품별 재고 수량 입력</h2>
          {(branchData.inventory || []).map(item => (
            <div key={item.id} className="flex items-center justify-between mb-3 border-b pb-3 last:border-b-0 last:pb-0 last:mb-0">
              <label htmlFor={`item-${item.id}`} className={`text-sm md:text-base ${getItemColor(inventory[item.id]?.quantity)}`}>
                {item.name}
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => handleQuantityChange(item.id, -1)}
                  className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 hover:bg-red-600 disabled:bg-gray-300"
                  disabled={inventory[item.id]?.quantity === -1}
                  aria-label={`${item.name} 수량 감소`}
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center text-sm md:text-base">
                  {inventory[item.id]?.quantity === -1 ? '충분' : inventory[item.id]?.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.id, 1)}
                  className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center ml-2 hover:bg-green-700"
                  aria-label={`${item.name} 수량 증가`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">재고 관련 추가 사항</h2>
          <textarea
            value={additionalNote}
            onChange={(e) => setAdditionalNote(e.target.value)}
            placeholder="재고 관련 특이사항이나 요청사항을 입력하세요..."
            className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
            rows="3"
          />
        </div>

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
            />
          );
        })}

        <div className="mb-6 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">추가 체크리스트</h2>
          {Object.entries(branchData.checklist || {}).map(([key, item]) => (
            <div key={key} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`checklist-${key}`}
                checked={checklist[key] || false}
                onChange={() => handleChecklistChange(key)}
                className="mr-2 h-4 w-4 text-green-700 border-gray-300 rounded focus:ring-green-600"
              />
              <label htmlFor={`checklist-${key}`} className="text-sm text-gray-700">
                {item.name}
                {item.description && (
                  <span className="text-gray-500 text-xs ml-1">({item.description})</span>
                )}
              </label>
            </div>
          ))}
        </div>

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
          모든 정보 복사하기
        </button>

        {copiedText && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow">
            <h3 className="font-semibold mb-2 text-gray-700">복사된 텍스트:</h3>
            <pre className="whitespace-pre-wrap text-xs bg-white p-3 rounded border border-gray-200 max-h-60 overflow-y-auto">{copiedText}</pre>
          </div>
        )}

        <Link
          to="/"
          className="mt-6 inline-block w-full text-center bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-300 text-base font-medium shadow active:bg-gray-700"
        >
          홈으로 돌아가기
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default UtilPage;
