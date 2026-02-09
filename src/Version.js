import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import VersionInfo from './components/VersionInfo';


const VersionPage = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow container mx-auto py-6 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">웹 버전 정보</h2>
        <div className="flex justify-end mt-2">
          <Link
            to="/"
            className="flex items-center text-green-700 hover:text-green-900 transition-colors text-sm md:text-base font-medium"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
      <div className="space-y-6">
        <VersionInfo
          date='26.02.09'
          version='1.5.0'
          changes='근무표 및 관리자 페이지 추가, 격주 근무 설정 기능 (A주/B주 오전·오후 개별 지정), 근무자별 고유 색상 표시, 인수인계 작성자 버튼 선택 방식 변경'
        />
        <VersionInfo
          date='26.02.07'
          version='1.4.0'
          changes='인수인계 메모장 기능 추가 (Supabase 연동), 날짜 필터 및 검색 기능, 20건 단위 페이징 처리, 메인 화면에 인수인계 카드 추가'
        />
        <VersionInfo
          date='26.02.06'
          version='1.3.0'
          changes='룸 예약 입금 안내 형식 변경(선입금 시스템), 룸 예약 안내 메세지 버튼 추가, 룸 예약 확정 메시지 업데이트, 회원 안내 도구에 퇴실처리/시간복구 안내 버튼 추가, 사물함 만료 메시지 업데이트, 회원 안내 도구 범주화, 오픈/마감 업무 메뉴 제거'
        />
        <VersionInfo
          date='26.02.05'
          version='1.2.0'
          changes='룸 예약 금액 버튼 추가, 마감 체크리스트 간소화, 주차 안내 제거'
        />
        <VersionInfo
          date='26.02.05'
          version='1.1.0'
          changes='강남 4호점 전용 버전으로 분리 (slab-util에서 분리)'
        />
        <VersionInfo
          date='25.09.29 오후 10시'
          version='1.0.4'
          changes= '2호점 4시간 이벤트 변경'
        />
      <VersionInfo
          date='25.07.15 오후 4시'
          version='1.0.3'
          changes= '2호점 한정 신규 체험 이벤트 추가'
        />
        <VersionInfo
          date='25.06.04 오후 6시'
          version='1.0.2'
          changes= '2호점 마감 유틸 수정, 에어컨 예약 시간 입력 기능 추가'
        />
        <VersionInfo
          date='25.06.02 오후 7시'
          version='1.0.1'
          changes= '온습도 보고 기능 추가, 2호점 마감 유틸 최적화'
        />
       </div>
    </main>
    <Footer />
  </div>
);

export default VersionPage;
