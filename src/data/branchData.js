import { gangnam4Data } from './gangnam4Data.js';
import { guideMessages, guideMessageCategories, globalOpeningTasks, globalClosingTasks, globalRefundPolicyText } from './globalData.js';

export const branchData = {
  name: '강남4호점',
  ...gangnam4Data,
  openingTasks: [globalOpeningTasks],
  closingTasks: [globalClosingTasks],
  guideMessages: [
    ...guideMessages
  ],
  guideMessageCategories: guideMessageCategories,
  reservationMessages: [{
    confirmationText: "안녕하세요, 에스랩입니다. 룸 예약 확정 되셨습니다. 이용 및 변경/환불 정책을 참고해주세요.\n\n출입용 예약번호가 예약 1시간 전에 문자(카카오톡x)로 전송됩니다. 키오스크에서 예약번호를 입력하시고 나오는 출입 바코드를 이용해주세요.\n\n출입은 10분 전부터 가능하며 더 일찍 오셔도 룸과 카페존 출입이 불가합니다. 외부 음식은 안되지만 음료 반입은 가능하고, 다른 회원들을 배려해 조용히 이용해 주세요.\n\n예약 변경:\n예약 시간 24시간 전까지 1회에 한해 날짜와 시간 변경가능 (날짜 변경 시 추후 환불은 불가 합니다)\n\n환불:\n이용 3일 전부터 : 위약금 30%\n이용 1일 전 : 위약금 100%",
    refundPolicyText: globalRefundPolicyText,
    bankAccount: {
      bank: "기업은행",
      accountNumber: "59203202301019",
      accountHolder: "서승원"
    }
  }]
};
