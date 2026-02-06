const gangnam4ChecklistItems = {
  windows: {
    id: 'window',
    name: '창문 닫기',
    description: '창문이 제대로 닫혀있는지 확인'
  }
};

// 강남4호점 인벤토리 항목들
const gangnam4InventoryItems = [
  { id: 1, name: '5핀 충전기', unit: '개', currentStock: 0, minimumStock: 1 },
  { id: 2, name: 'A4 용지', unit: '장', currentStock: 0, minimumStock: 100 },
  { id: 3, name: 'B4 용지', unit: '장', currentStock: 0, minimumStock: 50 },
  { id: 4, name: 'c타입 충전기', unit: '개', currentStock: 0, minimumStock: 1 },
  { id: 5, name: '둥글레차', unit: '봉', currentStock: 0, minimumStock: 5 },
  { id: 6, name: '레츠비', unit: '개', currentStock: 0, minimumStock: 10 },
  { id: 7, name: '립톤', unit: '봉', currentStock: 0, minimumStock: 5 },
  { id: 8, name: '매실차 원액', unit: '병', currentStock: 0, minimumStock: 1 },
  { id: 9, name: '메밀차', unit: '봉', currentStock: 0, minimumStock: 5 },
  { id: 10, name: '물', unit: '병', currentStock: 0, minimumStock: 24 },
  { id: 11, name: '바닐라 시럽', unit: '병', currentStock: 0, minimumStock: 1 },
  { id: 12, name: '보드마카', unit: '개', currentStock: 0, minimumStock: 2 },
  { id: 13, name: '스푼', unit: '개', currentStock: 0, minimumStock: 10 },
  { id: 14, name: '스트로우', unit: '개', currentStock: 0, minimumStock: 50 },
  { id: 15, name: '슈가 시럽', unit: '병', currentStock: 0, minimumStock: 1 },
  { id: 16, name: '아이스티', unit: '봉', currentStock: 0, minimumStock: 5 },
  { id: 17, name: '아이폰 충전기', unit: '개', currentStock: 0, minimumStock: 1 },
  { id: 18, name: '옥수수수염차', unit: '봉', currentStock: 0, minimumStock: 5 },
  { id: 19, name: '오미자차 원액', unit: '병', currentStock: 0, minimumStock: 1 },
  { id: 20, name: '우유', unit: '팩', currentStock: 0, minimumStock: 2 },
  { id: 21, name: '원두', unit: '봉', currentStock: 0, minimumStock: 5 },
  { id: 22, name: '작은 종이컵', unit: '개', currentStock: 0, minimumStock: 50 },
  { id: 23, name: '종량제 봉투', unit: '개', currentStock: 0, minimumStock: 10 },
  { id: 24, name: '종이컵 뚜껑', unit: '개', currentStock: 0, minimumStock: 50 },
  { id: 25, name: '주스', unit: '개', currentStock: 0, minimumStock: 10 },
  { id: 26, name: '점보롤', unit: '개', currentStock: 0, minimumStock: 2 },
  { id: 27, name: '카라멜 시럽', unit: '병', currentStock: 0, minimumStock: 1 },
  { id: 28, name: '카페존 냅킨', unit: '개', currentStock: 0, minimumStock: 50 },
  { id: 29, name: '코코볼', unit: '봉', currentStock: 0, minimumStock: 5 },
  { id: 30, name: '콘푸라이트', unit: '병', currentStock: 0, minimumStock: 1 },
  { id: 31, name: '큰 비닐봉투', unit: '개', currentStock: 0, minimumStock: 10 },
  { id: 32, name: '큰 종이컵', unit: '개', currentStock: 0, minimumStock: 50 },
  { id: 33, name: '포크', unit: '개', currentStock: 0, minimumStock: 10 },
  { id: 34, name: '핫식스', unit: '개', currentStock: 0, minimumStock: 10 },
  { id: 35, name: '핫초코', unit: '봉', currentStock: 0, minimumStock: 5 },
  { id: 36, name: '핸드워시', unit: '병', currentStock: 0, minimumStock: 1 },
  { id: 37, name: '핸드타월', unit: '개', currentStock: 0, minimumStock: 2 },
  { id: 38, name: '현미녹차', unit: '봉', currentStock: 0, minimumStock: 5 },
  { id: 39, name: '히비스커스', unit: '봉', currentStock: 0, minimumStock: 5 },
  { id: 40, name: '사탕', unit: '개', currentStock: 0, minimumStock: 20 },
  { id: 41, name: '키친타올', unit: '개', currentStock: 0, minimumStock: 2 }
];

// 강남4호점 에어컨 설정
const gangnam4RoomData = {
  studyRoom: {
    name: '스터디존',
    temperature: '',
    humidity: '',
    airConditioners: [
      { location: '입구쪽', mode: 'off', temperature: '' },
      { location: '창가쪽', mode: 'off', temperature: '' }
    ]
  },
  loungeRoom: {
    name: '라운지존',
    temperature: '',
    humidity: '',
    airConditioners: [
      { location: '입구쪽', mode: 'off', temperature: '' },
      { location: '창가쪽', mode: 'off', temperature: '' }
    ]
  }
};

// 강남4호점 데이터 통합
export const gangnam4Data = {
  checklist: gangnam4ChecklistItems,
  inventory: gangnam4InventoryItems,
  room: gangnam4RoomData
};
