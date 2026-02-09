import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import Header from '../Header';
import { supabase } from '../supabaseClient';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// Staff color palette — rainbow spectrum, pastel tones
const STAFF_COLORS = [
  { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-400' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-400' },
  { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', dot: 'bg-yellow-400' },
  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dot: 'bg-green-400' },
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-400' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', dot: 'bg-indigo-400' },
  { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300', dot: 'bg-violet-400' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', dot: 'bg-pink-400' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300', dot: 'bg-cyan-400' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-400' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300', dot: 'bg-fuchsia-400' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', dot: 'bg-rose-400' },
];

const DEFAULT_COLOR = { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-400', dot: 'bg-gray-400' };

/**
 * Determine whether a given date falls in A-week or B-week.
 * Weeks are aligned to Monday. If the difference in weeks from
 * biweeklyStartDate is even → A week, odd → B week.
 * Returns 'A' or 'B'. If no start date is set, returns null.
 */
const getWeekType = (dateStr, biweeklyStartDate) => {
  if (!biweeklyStartDate) return null;

  // Align a date to its Monday (start of ISO week)
  const alignToMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day; // Monday = 1
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const startMonday = alignToMonday(biweeklyStartDate);
  const targetMonday = alignToMonday(dateStr);

  const diffMs = targetMonday.getTime() - startMonday.getTime();
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));

  // Even weeks = A, odd weeks = B
  // Use modulo that handles negative numbers correctly
  return ((diffWeeks % 2) + 2) % 2 === 0 ? 'A' : 'B';
};

const SchedulePage = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [templates, setTemplates] = useState([]); // schedule_templates rows
  const [overrides, setOverrides] = useState([]); // schedule_overrides for current month
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [biweeklyStartDate, setBiweeklyStartDate] = useState(null);

  // Build color map: each staff gets a unique color by sorted index
  const staffColorMap = useMemo(() => {
    const map = {};
    staffList.forEach((s, i) => {
      map[s.name] = STAFF_COLORS[i % STAFF_COLORS.length];
    });
    return map;
  }, [staffList]);

  const getStaffColor = useCallback((name) => {
    if (!name) return DEFAULT_COLOR;
    return staffColorMap[name] || DEFAULT_COLOR;
  }, [staffColorMap]);

  // Modal state
  const [modalDate, setModalDate] = useState(null); // 'YYYY-MM-DD' or null
  const [modalMorning, setModalMorning] = useState('');
  const [modalAfternoon, setModalAfternoon] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDate = new Date(year, month + 1, 0).getDate();
    const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDate).padStart(2, '0')}`;

    const [templatesRes, overridesRes, staffRes, settingsRes] = await Promise.all([
      supabase.from('schedule_templates').select('*'),
      supabase
        .from('schedule_overrides')
        .select('*')
        .gte('date', firstDay)
        .lte('date', lastDay),
      supabase.from('staff').select('*').order('name', { ascending: true }),
      supabase
        .from('schedule_settings')
        .select('value')
        .eq('key', 'biweekly_start_date')
        .single(),
    ]);

    if (!templatesRes.error) setTemplates(templatesRes.data || []);
    if (!overridesRes.error) setOverrides(overridesRes.data || []);
    if (!staffRes.error) setStaffList(staffRes.data || []);
    if (!settingsRes.error && settingsRes.data) {
      setBiweeklyStartDate(settingsRes.data.value);
    } else {
      setBiweeklyStartDate(null);
    }

    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPrevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  // Leading empty cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const getStaffForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month, day).getDay();

    // 1. Overrides take priority
    const morningOverride = overrides.find((o) => o.date === dateStr && o.shift === 'morning');
    const afternoonOverride = overrides.find((o) => o.date === dateStr && o.shift === 'afternoon');

    // 2. Determine week type for this date
    const weekType = getWeekType(dateStr, biweeklyStartDate);

    // 3. Find matching template: prefer specific week_type, fallback to 'every'
    const findTemplate = (shift) => {
      // Try week-specific template first (A or B)
      if (weekType) {
        const specific = templates.find(
          (t) => t.day_of_week === dayOfWeek && t.shift === shift && t.week_type === weekType
        );
        if (specific) return specific;
      }
      // Fallback to 'every' template
      return templates.find(
        (t) => t.day_of_week === dayOfWeek && t.shift === shift && t.week_type === 'every'
      );
    };

    const morningTemplate = findTemplate('morning');
    const afternoonTemplate = findTemplate('afternoon');

    return {
      morning: morningOverride?.staff_name || morningTemplate?.staff_name || '',
      afternoon: afternoonOverride?.staff_name || afternoonTemplate?.staff_name || '',
      morningOverridden: !!morningOverride,
      afternoonOverridden: !!afternoonOverride,
      hasOverride: !!morningOverride || !!afternoonOverride,
    };
  };

  // Get the effective template staff_name for a given date/shift (considering week_type)
  const getEffectiveTemplateStaff = (dateStr, shift) => {
    const dayOfWeek = new Date(dateStr).getDay();
    const weekType = getWeekType(dateStr, biweeklyStartDate);

    if (weekType) {
      const specific = templates.find(
        (t) => t.day_of_week === dayOfWeek && t.shift === shift && t.week_type === weekType
      );
      if (specific) return specific.staff_name;
    }
    const every = templates.find(
      (t) => t.day_of_week === dayOfWeek && t.shift === shift && t.week_type === 'every'
    );
    return every?.staff_name || '';
  };

  const openModal = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const staff = getStaffForDate(day);
    setModalDate(dateStr);
    setModalMorning(staff.morning);
    setModalAfternoon(staff.afternoon);
  };

  const closeModal = () => {
    setModalDate(null);
    setModalMorning('');
    setModalAfternoon('');
  };

  const handleSaveOverride = async () => {
    if (!modalDate) return;
    setSaving(true);

    const morningTemplateName = getEffectiveTemplateStaff(modalDate, 'morning');
    const afternoonTemplateName = getEffectiveTemplateStaff(modalDate, 'afternoon');

    const promises = [];

    // Morning: if different from effective template, upsert override; if same, delete override
    if (modalMorning && modalMorning !== morningTemplateName) {
      promises.push(
        supabase
          .from('schedule_overrides')
          .upsert(
            { date: modalDate, shift: 'morning', staff_name: modalMorning },
            { onConflict: 'date,shift' }
          )
      );
    } else {
      promises.push(
        supabase
          .from('schedule_overrides')
          .delete()
          .eq('date', modalDate)
          .eq('shift', 'morning')
      );
    }

    // Afternoon: same logic
    if (modalAfternoon && modalAfternoon !== afternoonTemplateName) {
      promises.push(
        supabase
          .from('schedule_overrides')
          .upsert(
            { date: modalDate, shift: 'afternoon', staff_name: modalAfternoon },
            { onConflict: 'date,shift' }
          )
      );
    } else {
      promises.push(
        supabase
          .from('schedule_overrides')
          .delete()
          .eq('date', modalDate)
          .eq('shift', 'afternoon')
      );
    }

    await Promise.all(promises);
    setSaving(false);
    closeModal();
    fetchData();
  };

  const handleResetOverride = async (dateStr) => {
    if (!window.confirm('이 날짜의 변경 사항을 기본 근무로 되돌리시겠습니까?')) return;

    await supabase
      .from('schedule_overrides')
      .delete()
      .eq('date', dateStr);

    fetchData();
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Current week type badge
  const currentWeekType = getWeekType(todayStr, biweeklyStartDate);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 max-w-4xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center text-green-700 hover:text-green-900">
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>메인으로</span>
          </Link>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">근무표</h2>
          <div className="w-20" />
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-800 min-w-[140px] text-center">
            {year}년 {month + 1}월
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {currentWeekType && (
            <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
              currentWeekType === 'A'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              이번 주: {currentWeekType}주
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">불러오는 중...</p>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className={`text-center text-sm font-semibold py-2 ${
                    i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="min-h-[80px]" />;
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const staff = getStaffForDate(day);
                const dayOfWeek = new Date(year, month, day).getDay();
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={day}
                    className={`min-h-[80px] md:min-h-[100px] border rounded-lg p-1 cursor-pointer transition-colors hover:bg-green-50 ${
                      isToday ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                    } ${staff.hasOverride ? 'ring-1 ring-amber-400' : ''}`}
                    onClick={() => openModal(day)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </span>
                      {staff.hasOverride && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetOverride(dateStr);
                          }}
                          className="p-0.5 text-amber-500 hover:text-amber-700 rounded"
                          title="기본으로 되돌리기"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {staff.morning && (() => {
                        const color = getStaffColor(staff.morning);
                        return (
                          <div
                            className={`text-xs px-1 py-0.5 rounded truncate ${color.bg} ${color.text} ${
                              staff.morningOverridden ? `border border-dashed ${color.border}` : ''
                            }`}
                          >
                            오전 {staff.morning}
                          </div>
                        );
                      })()}
                      {staff.afternoon && (() => {
                        const color = getStaffColor(staff.afternoon);
                        return (
                          <div
                            className={`text-xs px-1 py-0.5 rounded truncate ${color.bg} ${color.text} ${
                              staff.afternoonOverridden ? `border border-dashed ${color.border}` : ''
                            }`}
                          >
                            오후 {staff.afternoon}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-600">
              {staffList.map((s) => {
                const color = getStaffColor(s.name);
                return (
                  <div key={s.id} className="flex items-center gap-1">
                    <span className={`inline-block w-3 h-3 rounded ${color.dot}`} />
                    {s.name}
                  </div>
                );
              })}
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-300">
                <span className="inline-block w-3 h-3 rounded border border-dashed border-gray-400 bg-gray-100" />
                변경됨
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal */}
      {modalDate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {modalDate} 근무 변경
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Morning shift */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                오전 근무자
              </label>
              <div className="flex flex-wrap gap-2">
                {staffList.map((s) => {
                  const color = getStaffColor(s.name);
                  const selected = modalMorning === s.name;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setModalMorning(s.name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selected
                          ? `${color.bg} ${color.text} ring-2 ring-offset-1 ${color.border.replace('border-', 'ring-')}`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Afternoon shift */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                오후 근무자
              </label>
              <div className="flex flex-wrap gap-2">
                {staffList.map((s) => {
                  const color = getStaffColor(s.name);
                  const selected = modalAfternoon === s.name;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setModalAfternoon(s.name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selected
                          ? `${color.bg} ${color.text} ring-2 ring-offset-1 ${color.border.replace('border-', 'ring-')}`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveOverride}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
