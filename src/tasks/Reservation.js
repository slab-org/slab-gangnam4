import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../Header';
import { branchData } from '../data';


const Button = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 ${className}`}
  >
    {children}
  </button>
);

const Input = ({ type, id, value, onChange, className }) => (
  <input
    type={type}
    id={id}
    value={value}
    onChange={onChange}
    className={`border rounded px-2 py-1 w-full ${className}`}
  />
);

const toast = ({ title, description }) => {
  alert(`${title}: ${description}`);
};

const CopyButton = ({ text, children, onCopy }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "복사 완료",
        description: "텍스트가 클립보드에 복사되었습니다.",
      });
      onCopy(text);
    });
  };

  return (
    <Button onClick={handleCopy} className="mb-4 w-full sm:w-auto">
      {children}
    </Button>
  );
};

const ROOM_PRICE_PER_30MIN = {
  '2인실': 3000,
  '4인실': 5500,
};

const TIME_SLOTS = [
  { label: '1시간', multiplier: 2 },
  { label: '2시간', multiplier: 4 },
  { label: '3시간', multiplier: 6 },
];

const ReservationPage = () => {
  const [amount, setAmount] = useState(0);
  const [copiedText, setCopiedText] = useState('');

  const refundPolicyText = branchData.reservationMessages[0]?.refundPolicyText || [];
  const confirmationText = branchData.reservationMessages[0]?.confirmationText || [];
  const bankAccount = branchData.reservationMessages[0]?.bankAccount || {};

  const formatAmount = (value) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const handleConfirm = () => {
    navigator.clipboard.writeText(confirmationText);
    setCopiedText(confirmationText);
    toast({
      title: "복사 완료",
      description: "예약 확정 안내가 클립보드에 복사되었습니다.",
    });
  };

  const depositText = `저희가 선입금 시스템입니다.

${formatAmount(amount)}원을 아래의 계좌번호로 송금해주시면 예약확정 도와드리겠습니다.

계좌번호 : ${bankAccount.accountNumber} ${bankAccount.bank} (${bankAccount.accountHolder})

30분 안에 입금이 없는 경우 예약 신청은 취소 되니 참고해주세요.`;

  const reservationFormText = `1. 어플 이용 (아래 링크 클릭)
https://slabkorea-mo3.imweb.me/45


2. 룸 예약 신청 양식

> 신규 / 기존:
> 성함:
> 전화번호:
> 룸 종류 (2인실 / 4인실):
> 예약 날짜 & 시간 :
> 환불 정책에 동의하십니까?

-
시간당 가격 (유효기간: 1년)
- 2인실: 6,000원 (오픈 할인가)
- 4인실: 9,000원 (오픈 할인가)
- 10시간 충전권(1년): 5% 할인
- 20시간 충전권(1년): 10% 할인

※ 룸 충전권 환불은 구입 후 7일 안에만 가능

예약 취소
- 이용 3일 전부터: 위약금 30%
- 이용 1일 전부터: 취소 불가

예약 변경
- 예약 날짜 변경: 1일 전
※ 변경 후 재변경 or 환불 불가`;

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
      <main className='flex-grow container mx-auto px-4 py-8'>
      <div className="mb-6 flex justify-between items-center"> {/* 플렉스 레이아웃 사용 */}
        <h2 className="text-2xl font-bold">룸 예약 도구</h2>
        <Link
          to="/" // 홈으로 돌아가는 링크
          className="flex items-center text-green-700 hover:text-green-900 transition-colors text-sm md:text-base font-medium"
        >
          <ArrowLeft className="mr-2" size={16} />
          홈으로 돌아가기
        </Link>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          가격표
        </label>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-r border-gray-200"></th>
                {TIME_SLOTS.map((slot) => (
                  <th key={slot.label} className="px-2 py-2 text-center font-semibold text-gray-700 border-b border-r last:border-r-0 border-gray-200 whitespace-nowrap">
                    {slot.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(ROOM_PRICE_PER_30MIN).map(([room, price]) => (
                <tr key={room} className="border-b last:border-b-0">
                  <td className="px-2 py-2 font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">{room}</td>
                  {TIME_SLOTS.map((slot) => {
                    const cellAmount = price * slot.multiplier;
                    return (
                      <td
                        key={slot.label}
                        onClick={() => setAmount(prev => prev + cellAmount)}
                        className="px-2 py-2 text-center text-gray-600 border-r last:border-r-0 border-gray-200 whitespace-nowrap cursor-pointer hover:bg-green-50 hover:text-green-700 active:bg-green-100 transition-colors"
                      >
                        {formatAmount(cellAmount)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-1">금액을 클릭하면 아래 입금 금액에 추가됩니다</p>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          입금 금액
        </label>
        <div className="flex items-center gap-3 mb-3">
          <Input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-32 text-right text-lg font-semibold"
          />
          <span className="text-lg font-medium text-gray-600">원</span>
          <button
            onClick={() => setAmount(0)}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 whitespace-nowrap"
          >
            초기화
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(ROOM_PRICE_PER_30MIN).map(([room, price]) => (
            <React.Fragment key={room}>
              <button
                onClick={() => setAmount(prev => prev + price)}
                className="px-3 py-1.5 text-sm rounded font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200"
              >
                +{room} 30분 (+{formatAmount(price)})
              </button>
              <button
                onClick={() => setAmount(prev => Math.max(0, prev - price))}
                className="px-3 py-1.5 text-sm rounded font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
              >
                -{room} 30분 (-{formatAmount(price)})
              </button>
            </React.Fragment>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={depositText} onCopy={setCopiedText}>입금 안내 복사</CopyButton>
          <Button onClick={handleConfirm} className="mb-4">예약 확정 안내 복사</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={refundPolicyText} onCopy={setCopiedText}>환불 정책 복사</CopyButton>
          <CopyButton text={reservationFormText} onCopy={setCopiedText}>룸 예약 신청 양식 복사</CopyButton>
        </div>
      </div>

      {copiedText && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">복사된 텍스트:</h2>
          <pre className="whitespace-pre-wrap break-words">{copiedText}</pre>
        </div>
      )}
      </main>
    </div>
  );
};

export default ReservationPage;
