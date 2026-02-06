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

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/util" element={<UtilPage />} />
      <Route path="/temperature" element={<TemperatureReportPage />} />
      <Route path="/reservation" element={<ReservationPage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route path="/open-tasks" element={<OpenTasks />} />
      <Route path="/closing-tasks" element={<ClosingTasks />} />
      <Route path="/version" element={<VersionPage />} />
    </Routes>
  );
};

export default App;
