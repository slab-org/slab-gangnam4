import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Check, X, Save } from 'lucide-react';
import Header from '../Header';
import { supabase } from '../supabaseClient';

const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;
const SESSION_KEY = 'admin_authenticated';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// Key for local assignments map: "day_shift_weekType"
const makeKey = (day, shift, weekType) => `${day}_${shift}_${weekType}`;

const buildAssignmentsMap = (templates) => {
  const map = {};
  templates.forEach((t) => {
    map[makeKey(t.day_of_week, t.shift, t.week_type)] = t.staff_name;
  });
  return map;
};

const buildBiweeklyMap = (templates) => {
  const map = {};
  templates.forEach((t) => {
    if (t.week_type === 'A' || t.week_type === 'B') {
      map[`${t.day_of_week}_${t.shift}`] = true;
    }
  });
  return map;
};

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  );
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [staffList, setStaffList] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);

  // Schedule template state
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  // Saved state (from DB)
  const [savedAssignments, setSavedAssignments] = useState({});
  const [savedBiweeklyShifts, setSavedBiweeklyShifts] = useState({});

  // Local editable state
  const [localAssignments, setLocalAssignments] = useState({});
  const [biweeklyShifts, setBiweeklyShifts] = useState({});
  const initRef = useRef(false);

  // Biweekly start date
  const [biweeklyStartDate, setBiweeklyStartDate] = useState('');
  const [biweeklyInput, setBiweeklyInput] = useState('');
  const [biweeklySaving, setBiweeklySaving] = useState(false);

  // Detect unsaved changes
  const hasChanges =
    JSON.stringify(localAssignments) !== JSON.stringify(savedAssignments) ||
    JSON.stringify(biweeklyShifts) !== JSON.stringify(savedBiweeklyShifts);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.');
    }
  };

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('근무자 목록 불러오기 실패:', error);
    } else {
      setStaffList(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchStaff();
    }
  }, [authenticated, fetchStaff]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from('staff')
      .insert([{ name: trimmed }]);

    if (error) {
      if (error.code === '23505') {
        alert('이미 등록된 이름입니다.');
      } else {
        console.error('근무자 추가 실패:', error);
        alert('근무자 추가에 실패했습니다.');
      }
      return;
    }

    setNewName('');
    fetchStaff();
  };

  const handleEditStart = (staff) => {
    setEditingId(staff.id);
    setEditingName(staff.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleEditSave = async (id) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from('staff')
      .update({ name: trimmed })
      .eq('id', id);

    if (error) {
      if (error.code === '23505') {
        alert('이미 등록된 이름입니다.');
      } else {
        console.error('근무자 수정 실패:', error);
        alert('근무자 수정에 실패했습니다.');
      }
      return;
    }

    setEditingId(null);
    setEditingName('');
    fetchStaff();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" 근무자를 삭제하시겠습니까?`)) return;

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('근무자 삭제 실패:', error);
      alert('근무자 삭제에 실패했습니다.');
      return;
    }

    fetchStaff();
  };

  // Biweekly start date
  const fetchBiweeklyStartDate = useCallback(async () => {
    const { data, error } = await supabase
      .from('schedule_settings')
      .select('value')
      .eq('key', 'biweekly_start_date')
      .single();

    if (!error && data) {
      setBiweeklyStartDate(data.value);
      setBiweeklyInput(data.value);
    }
  }, []);

  const handleBiweeklySave = async () => {
    if (!biweeklyInput) return;
    setBiweeklySaving(true);

    const { error } = await supabase
      .from('schedule_settings')
      .upsert(
        { key: 'biweekly_start_date', value: biweeklyInput },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('격주 기준일 저장 실패:', error);
      alert('격주 기준일 저장에 실패했습니다.');
    } else {
      setBiweeklyStartDate(biweeklyInput);
    }
    setBiweeklySaving(false);
  };

  // Fetch templates and sync both saved + local state
  const fetchScheduleTemplates = useCallback(async () => {
    setScheduleLoading(true);
    const { data, error } = await supabase
      .from('schedule_templates')
      .select('*')
      .order('day_of_week', { ascending: true });

    if (!error) {
      const templates = data || [];
      const assignments = buildAssignmentsMap(templates);
      const bwMap = buildBiweeklyMap(templates);

      setSavedAssignments(assignments);
      setSavedBiweeklyShifts(bwMap);

      // Only set local state on first load (or after save)
      if (!initRef.current) {
        setLocalAssignments(assignments);
        setBiweeklyShifts(bwMap);
        initRef.current = true;
      }
    }
    setScheduleLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchScheduleTemplates();
      fetchBiweeklyStartDate();
    }
  }, [authenticated, fetchScheduleTemplates, fetchBiweeklyStartDate]);

  // Local-only: update a staff assignment
  const handleLocalChange = (dayOfWeek, shift, staffName, weekType) => {
    const key = makeKey(dayOfWeek, shift, weekType);
    setLocalAssignments((prev) => {
      const next = { ...prev };
      if (staffName) {
        next[key] = staffName;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  // Local-only: toggle biweekly for a shift
  const handleToggleBiweekly = (dayIndex, shift) => {
    const bwKey = `${dayIndex}_${shift}`;
    const isBiweekly = biweeklyShifts[bwKey];

    if (isBiweekly) {
      // Biweekly → Every: copy A-week value to 'every', clear A/B
      const aKey = makeKey(dayIndex, shift, 'A');
      const bKey = makeKey(dayIndex, shift, 'B');
      const everyKey = makeKey(dayIndex, shift, 'every');
      const aVal = localAssignments[aKey] || '';

      setLocalAssignments((prev) => {
        const next = { ...prev };
        delete next[aKey];
        delete next[bKey];
        if (aVal) {
          next[everyKey] = aVal;
        }
        return next;
      });
      setBiweeklyShifts((prev) => ({ ...prev, [bwKey]: false }));
    } else {
      // Every → Biweekly: copy 'every' value to A-week, clear 'every'
      const everyKey = makeKey(dayIndex, shift, 'every');
      const aKey = makeKey(dayIndex, shift, 'A');
      const everyVal = localAssignments[everyKey] || '';

      setLocalAssignments((prev) => {
        const next = { ...prev };
        delete next[everyKey];
        if (everyVal) {
          next[aKey] = everyVal;
        }
        return next;
      });
      setBiweeklyShifts((prev) => ({ ...prev, [bwKey]: true }));
    }
  };

  // Discard local changes
  const handleDiscardChanges = () => {
    setLocalAssignments({ ...savedAssignments });
    setBiweeklyShifts({ ...savedBiweeklyShifts });
  };

  // Save all changes to DB at once
  const handleSaveAll = async () => {
    setScheduleSaving(true);
    const promises = [];

    for (let day = 0; day < 7; day++) {
      for (const shift of ['morning', 'afternoon']) {
        const bwKey = `${day}_${shift}`;
        const isBiweekly = biweeklyShifts[bwKey];

        if (isBiweekly) {
          // Delete stale 'every' if it existed in DB
          const everyKey = makeKey(day, shift, 'every');
          if (savedAssignments[everyKey]) {
            promises.push(
              supabase.from('schedule_templates').delete()
                .eq('day_of_week', day).eq('shift', shift).eq('week_type', 'every')
            );
          }

          // Upsert/delete A and B
          for (const wt of ['A', 'B']) {
            const key = makeKey(day, shift, wt);
            const localVal = localAssignments[key] || '';
            const savedVal = savedAssignments[key] || '';

            if (localVal !== savedVal) {
              if (localVal) {
                promises.push(
                  supabase.from('schedule_templates').upsert(
                    { day_of_week: day, shift, staff_name: localVal, week_type: wt },
                    { onConflict: 'day_of_week,shift,week_type' }
                  )
                );
              } else {
                promises.push(
                  supabase.from('schedule_templates').delete()
                    .eq('day_of_week', day).eq('shift', shift).eq('week_type', wt)
                );
              }
            }
          }
        } else {
          // Delete stale A/B if they existed in DB
          for (const wt of ['A', 'B']) {
            const key = makeKey(day, shift, wt);
            if (savedAssignments[key]) {
              promises.push(
                supabase.from('schedule_templates').delete()
                  .eq('day_of_week', day).eq('shift', shift).eq('week_type', wt)
              );
            }
          }

          // Upsert/delete 'every'
          const everyKey = makeKey(day, shift, 'every');
          const localVal = localAssignments[everyKey] || '';
          const savedVal = savedAssignments[everyKey] || '';

          if (localVal !== savedVal) {
            if (localVal) {
              promises.push(
                supabase.from('schedule_templates').upsert(
                  { day_of_week: day, shift, staff_name: localVal, week_type: 'every' },
                  { onConflict: 'day_of_week,shift,week_type' }
                )
              );
            } else {
              promises.push(
                supabase.from('schedule_templates').delete()
                  .eq('day_of_week', day).eq('shift', shift).eq('week_type', 'every')
              );
            }
          }
        }
      }
    }

    await Promise.all(promises);

    // Refresh from DB and sync local state
    initRef.current = false;
    await fetchScheduleTemplates();
    setScheduleSaving(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 max-w-md">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center text-green-700 hover:text-green-900">
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>메인으로</span>
            </Link>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">관리자</h2>
            <div className="w-20" />
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">비밀번호 입력</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm mb-3">{passwordError}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              확인
            </button>
          </form>
        </main>
      </div>
    );
  }

  const getLocalStaff = (dayOfWeek, shift, weekType) => {
    return localAssignments[makeKey(dayOfWeek, shift, weekType)] || '';
  };

  const renderStaffSelect = (dayIndex, shift, weekType) => (
    <select
      value={getLocalStaff(dayIndex, shift, weekType)}
      onChange={(e) => handleLocalChange(dayIndex, shift, e.target.value, weekType)}
      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      <option value="">미지정</option>
      {staffList.map((s) => (
        <option key={s.id} value={s.name}>{s.name}</option>
      ))}
    </select>
  );

  const renderShiftCell = (dayIndex, shift) => {
    const bwKey = `${dayIndex}_${shift}`;
    const isBiweekly = biweeklyShifts[bwKey];

    return (
      <td className="px-3 py-3 align-top">
        <button
          onClick={() => handleToggleBiweekly(dayIndex, shift)}
          className={`mb-2 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
            isBiweekly
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {isBiweekly ? '격주' : '매주'}
        </button>
        {isBiweekly ? (
          <div className="space-y-2">
            <div>
              <span className="text-xs text-green-600 font-medium mb-1 block">A주</span>
              {renderStaffSelect(dayIndex, shift, 'A')}
            </div>
            <div>
              <span className="text-xs text-blue-600 font-medium mb-1 block">B주</span>
              {renderStaffSelect(dayIndex, shift, 'B')}
            </div>
          </div>
        ) : (
          renderStaffSelect(dayIndex, shift, 'every')
        )}
      </td>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center text-green-700 hover:text-green-900">
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>메인으로</span>
          </Link>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">근무자 관리</h2>
          <div className="w-20" />
        </div>

        {/* 근무자 추가 */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="근무자 이름"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </form>

        {/* 근무자 목록 */}
        {loading ? (
          <p className="text-center text-gray-500 py-8">불러오는 중...</p>
        ) : staffList.length === 0 ? (
          <p className="text-center text-gray-400 py-8">등록된 근무자가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {staffList.map((staff) => (
              <div
                key={staff.id}
                className="flex items-center justify-between bg-white rounded-lg shadow-sm px-4 py-3"
              >
                {editingId === staff.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mr-2"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave(staff.id);
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditSave(staff.id)}
                        className="p-1.5 text-green-700 hover:bg-green-50 rounded transition-colors"
                        title="저장"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        title="취소"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-gray-800">{staff.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditStart(staff)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        title="수정"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id, staff.name)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 기본 근무 설정 */}
        <div className="mt-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">기본 근무 설정</h2>
          <p className="text-sm text-gray-500 mb-4">
            요일별 기본 근무자를 설정합니다. 근무표에서 반복 적용됩니다.
          </p>

          {/* 격주 기준일 설정 */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">격주 기준일 (A주 시작)</h3>
            <p className="text-xs text-gray-400 mb-3">
              격주 근무의 A주가 시작되는 요일의 날짜를 지정합니다.
            </p>
            <div className="flex gap-2">
              <input
                type="date"
                value={biweeklyInput}
                onChange={(e) => setBiweeklyInput(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleBiweeklySave}
                disabled={biweeklySaving || !biweeklyInput || biweeklyInput === biweeklyStartDate}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 text-sm"
              >
                {biweeklySaving ? '저장 중...' : '저장'}
              </button>
            </div>
            {biweeklyStartDate && (
              <p className="text-xs text-green-600 mt-2">
                현재 기준일: {biweeklyStartDate}
              </p>
            )}
          </div>

          {scheduleLoading ? (
            <p className="text-center text-gray-500 py-4">불러오는 중...</p>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">요일</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">오전</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">오후</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAY_LABELS.map((label, dayIndex) => (
                      <tr key={dayIndex} className="border-b last:border-b-0">
                        <td className={`px-3 py-3 text-sm font-medium align-top ${
                          dayIndex === 0 ? 'text-red-500' : dayIndex === 6 ? 'text-blue-500' : 'text-gray-700'
                        }`}>
                          {label}요일
                        </td>
                        {renderShiftCell(dayIndex, 'morning')}
                        {renderShiftCell(dayIndex, 'afternoon')}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 저장 / 취소 버튼 */}
              {hasChanges && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleDiscardChanges}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={scheduleSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {scheduleSaving ? '저장 중...' : '저장'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
