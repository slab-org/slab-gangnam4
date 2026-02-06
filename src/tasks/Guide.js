import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../Header';
import { branchData } from '../data';

const Button = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors ${className}`}
  >
    {children}
  </button>
);

const toast = ({ title, description }) => {
  alert(`${title}: ${description}`);
};

const CopyButton = ({ text, children, onCopy }) => {
  const handleCopy = () => {
    const formattedText = text.replace(/\\n/g, '\n');
    navigator.clipboard.writeText(formattedText).then(() => {
      toast({
        title: "복사 완료",
        description: "텍스트가 클립보드에 복사되었습니다.",
      });
      onCopy(formattedText);
    });
  };

  return (
    <Button onClick={handleCopy} className="w-full">
      {children}
    </Button>
  );
};

const GuidePage = () => {
  const [copiedText, setCopiedText] = useState('');

  const guideMessages = branchData.guideMessages || [];
  const categories = branchData.guideMessageCategories || [];

  const getMessagesByCategory = (categoryId) => {
    return guideMessages.filter(msg => msg.category === categoryId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">안내 메세지</h2>
        <Link
          to="/"
          className="flex items-center text-green-700 hover:text-green-900 transition-colors text-sm md:text-base font-medium"
        >
          <ArrowLeft className="mr-2" size={16} />
          홈으로 돌아가기
        </Link>
      </div>

        {categories.map((category) => (
          <div key={category.id} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
              {category.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getMessagesByCategory(category.id).map((guide, index) => (
                <div key={index} className="bg-white rounded-lg p-3">
                  <CopyButton text={guide.text} onCopy={setCopiedText}>
                    {guide.title} 복사
                  </CopyButton>
                </div>
              ))}
            </div>
          </div>
        ))}

        {copiedText && (
          <div className="mt-8 p-4 bg-gray-100 shadow rounded-lg">
            <h2 className="text-lg font-semibold mb-2">복사된 텍스트:</h2>
            <pre className="whitespace-pre-wrap break-words p-3 rounded">{copiedText}</pre>
          </div>
        )}
      </main>
    </div>
  );
};

export default GuidePage;
