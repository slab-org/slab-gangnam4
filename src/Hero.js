import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="bg-gray-100 py-12 md:py-20">
      <div className="container mx-auto text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">에스랩 유틸 도구<br />페이지입니다.</h2>
        <p className="text-lg md:text-xl mb-8">다른 추가 기능이 필요하시면,<br />윤병욱에게 문의 주세요.</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
          <Link
            to="/version"
            className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition duration-300 text-base font-medium shadow active:bg-green-900"
          >
            버전 관리
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
