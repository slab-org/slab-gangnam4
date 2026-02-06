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

const AmountButton = ({ value, onClick, isSubtract }) => (
  <button
    onClick={() => onClick(value, isSubtract)}
    className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
      isSubtract 
        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
        : 'bg-green-100 text-green-700 hover:bg-green-200'
    }`}
  >
    {isSubtract ? '-' : '+'}{new Intl.NumberFormat('ko-KR').format(value)}
  </button>
);

const ReservationPage = () => {
  const [amount, setAmount] = useState(0);
  const [copiedText, setCopiedText] = useState('');

  const refundPolicyText = branchData.reservationMessages[0]?.refundPolicyText || [];
  const confirmationText = branchData.reservationMessages[0]?.confirmationText || [];
  const bankAccount = branchData.reservationMessages[0]?.bankAccount || {};

  const amountPresets = [4000, 5500, 8000, 11000];

  const formatAmount = (value) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const handleAmountChange = (value, isSubtract) => {
    setAmount(prev => {
      const newAmount = isSubtract ? prev - value : prev + value;
      return Math.max(0, newAmount);
    });
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

  const reservationGuideText = `해당 양식 작성해서 회신해주시면 예약 도와드리겠습니다 :)

신규 or 기존(신규는 직원이 회원가입을 진행해 드립니다 pw: 휴대폰 뒷 4자리) : 
예약자 성함:
전화번호:
원하는 예약 날짜 & 시간:
룸 시간충전권 보유 여부:

예약 전날부터는 취소가 불가하니 유의해주세요^^

----
환불

- 이용 3일 전부터: 위약금 30% 
- 이용 1일 전부터: 위약금 100% 

변경

- 날짜 변경: 3일 전까지 가능
- 이용일 시간 변경: 1일 전까지`;

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
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
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
        <div className="flex flex-wrap gap-2 mb-3">
          {amountPresets.map(preset => (
            <AmountButton key={`add-${preset}`} value={preset} onClick={handleAmountChange} isSubtract={false} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {amountPresets.map(preset => (
            <AmountButton key={`sub-${preset}`} value={preset} onClick={handleAmountChange} isSubtract={true} />
          ))}
        </div>
        <CopyButton text={depositText} onCopy={setCopiedText}>입금 안내 복사</CopyButton>
      </div>

      <div className="mb-6">
        <CopyButton text={reservationGuideText} onCopy={setCopiedText}>룸 예약 안내 메세지 복사</CopyButton>
      </div>

      <div className="mb-6">
          <Button onClick={handleConfirm} className="w-full sm:w-auto">예약 확정 안내 복사</Button>
        </div>

      <div className="mb-6">
        <CopyButton text={refundPolicyText} onCopy={setCopiedText}>환불 정책 복사</CopyButton>
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
