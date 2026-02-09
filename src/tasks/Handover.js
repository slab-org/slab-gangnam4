import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../Header';
import { supabase } from '../supabaseClient';

const PAGE_SIZE = 20;

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Returns { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } for each filter
const getDateRange = (filter) => {
  const now = new Date();

  if (filter === 'week') {
    const day = now.getDay(); // 0=Sun
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMon);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: formatDate(monday), end: formatDate(sunday) };
  }

  if (filter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: formatDate(start), end: formatDate(end) };
  }

  if (filter === 'lastMonth') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: formatDate(start), end: formatDate(end) };
  }

  return null; // 'all'
};

const FILTERS = [
  { key: 'week', label: '이번 주' },
  { key: 'month', label: '이번 달' },
  { key: 'lastMonth', label: '저번 달' },
  { key: 'all', label: '전체' },
];

const HandoverPage = () => {
  const [memos, setMemos] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState('week');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    const fetchStaff = async () => {
      setStaffLoading(true);
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        setStaffList(data);
      }
      setStaffLoading(false);
    };
    fetchStaff();
  }, []);

  const fetchMemos = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('handovers')
      .select('*', { count: 'exact' });

    const range = getDateRange(activeFilter);
    if (range) {
      query = query.gte('date', range.start).lte('date', range.end);
    }

    const { data, error, count } = await query
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error('메모 불러오기 실패:', error);
    } else {
      setMemos(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [activeFilter, page]);

  useEffect(() => {
    fetchMemos();
  }, [fetchMemos]);

  const handleFilterChange = (key) => {
    setActiveFilter(key);
    setPage(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !author.trim()) return;

    const { error } = await supabase
      .from('handovers')
      .insert([{ title: '-', content: content.trim(), author: author.trim(), date: formatDate(new Date()) }]);

    if (error) {
      console.error('메모 저장 실패:', error);
      alert('메모 저장에 실패했습니다.');
      return;
    }

    setContent('');
    setShowForm(false);
    setPage(0);
    fetchMemos();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 메모를 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('handovers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('메모 삭제 실패:', error);
      alert('메모 삭제에 실패했습니다.');
      return;
    }

    fetchMemos();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 max-w-3xl">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center text-green-700 hover:text-green-900">
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>메인으로</span>
          </Link>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">인수인계</h2>
          <div className="w-20" />
        </div>

        {/* 필터 버튼 */}
        <div className="flex gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === f.key
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 메모 작성 토글 */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 mb-6 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 메모 작성
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-5 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">새 메모 작성</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작성자</label>
                {staffLoading ? (
                  <p className="text-sm text-gray-400">불러오는 중...</p>
                ) : staffList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {staffList.map((staff) => (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => setAuthor(author === staff.name ? '' : staff.name)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          author === staff.name
                            ? 'bg-green-700 text-white border-green-700'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {staff.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="이름"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="인수인계 내용을 작성하세요"
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setContent(''); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        )}

        {/* 결과 건수 */}
        <p className="text-sm text-gray-500 mb-3">총 {totalCount}건</p>

        {/* 메모 목록 */}
        {loading ? (
          <p className="text-center text-gray-500 py-8">불러오는 중...</p>
        ) : memos.length === 0 ? (
          <p className="text-center text-gray-400 py-8">작성된 메모가 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {memos.map((memo) => (
              <div key={memo.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">{memo.author}</span>
                      {' · '}
                      {memo.date}
                      {' · '}
                      {new Date(memo.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(memo.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-3"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-2 text-gray-700 text-sm whitespace-pre-wrap">{memo.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* 페이징 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HandoverPage;
