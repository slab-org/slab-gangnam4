import React from 'react';
import Header from './Header';
import Hero from './Hero';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { Hammer, Calendar, CalendarDays, MessageCircle, Thermometer, ClipboardList, Settings } from 'lucide-react';

const Feature = ({ icon: Icon, title, description, link }) => (
  <Link to={link} className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <Icon className="text-green-700 w-12 h-12 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 text-center">{description}</p>
  </Link>
);

const Features = () => (
  <section id="features" className="py-12 md:py-20">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">기능</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Feature 
          icon={Thermometer}
          title="온도 보고" 
          description="온도 문자 유틸" 
          link="/temperature"
        />
        <Feature 
          icon={Hammer} 
          title="유틸" 
          description="마감 유틸" 
          link="/util"
        />
        <Feature
          icon={ClipboardList}
          title="인수인계"
          description="날짜별 인수인계 메모장"
          link="/handover"
        />
        <Feature
          icon={Calendar}
          title="룸 예약 도구"
          description="룸 예약 유틸"
          link="/reservation"
        />
        <Feature
          icon={CalendarDays}
          title="근무표"
          description="월별 근무 스케줄"
          link="/schedule"
        />
        <Feature
          icon={MessageCircle}
          title="회원 안내 도구"
          description="주차, 좌석, 사물함, 소음 안내"
          link="/guide"
        />
        <Feature
          icon={Settings}
          title="관리자"
          description="근무자 관리"
          link="/admin"
        />
      </div>
    </div>
  </section>
);

const LandingPage = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow">
      <Hero />
      <Features />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
