import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import UtilPage from './Util';
import TemperatureReportPage from './TemperatureReport';
import VersionPage from './Version';
import OpenTasks from './tasks/OpenTasks';
import ClosingTasks from './tasks/ClosingTasks';
import GuidePage from './tasks/Guide';
import ReservationPage from './tasks/Reservation';
import HandoverPage from './tasks/Handover';
import AdminPage from './pages/Admin';
import SchedulePage from './pages/Schedule';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/util" element={<UtilPage />} />
      <Route path="/temperature" element={<TemperatureReportPage />} />
      <Route path="/reservation" element={<ReservationPage />} />
      <Route path="/handover" element={<HandoverPage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route path="/open-tasks" element={<OpenTasks />} />
      <Route path="/closing-tasks" element={<ClosingTasks />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/version" element={<VersionPage />} />
    </Routes>
  );
};

export default App;
