import React from "react";
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { branchData } from '../data';
import Header from "../Header";
import { Link } from "react-router-dom";

// TaskItem 컴포넌트
const TaskItem = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-lg md:text-xl font-semibold flex items-center space-x-2">
      <span className="text-gray-800">{title}</span>
    </h3>
    <ul className="list-disc pl-5 mt-3 space-y-3 text-sm md:text-base text-gray-700">
      {children}
    </ul>
  </div>
);

const OpenTasks = () => {
  // 강남4호점의 오프닝 업무를 가져옵니다.
  const openingTasks = branchData.openingTasks || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className='flex-grow container mx-auto px-4 py-8'>
      <div className="mb-6 flex justify-between items-center"> {/* 플렉스 레이아웃 사용 */}
        <h2 className="text-2xl font-bold">오픈 업무</h2>
        <Link
          to="/" // 홈으로 돌아가는 링크
          className="flex items-center text-green-700 hover:text-green-900 transition-colors text-sm md:text-base font-medium"
        >
          <ArrowLeft className="mr-2" size={16} />
          홈으로 돌아가기
        </Link>
      </div>

      {openingTasks.map((taskCategory, index) => (
        <div key={index} className="bg-white shadow-md rounded-lg p-4 md:p-6">
          <TaskItem title={taskCategory.title}>
            {taskCategory.tasks.map((task, taskIndex) => (
              <li key={taskIndex} className="list-none">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <h4 className="font-medium text-gray-800">{task.title}</h4>
                </div>
                <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-gray-600">
                  {task.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="ml-4">{detail}</li>
                  ))}
                </ul>
              </li>
            ))}
          </TaskItem>
        </div>
      ))}
      </main>
    </div>
  );
};

export default OpenTasks;
