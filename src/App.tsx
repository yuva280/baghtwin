import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CommandCenter } from './pages/CommandCenter';
import { DigitalTwin } from './pages/DigitalTwin';
import { Monitoring } from './pages/Monitoring';
import { DynocardAnalysis } from './pages/DynocardAnalysis';
import { CSSOptimizer } from './pages/CSSOptimizer';
import { SRPControl } from './pages/SRPControl';
import { Predictions } from './pages/Predictions';
import { Maintenance } from './pages/Maintenance';
import { Analytics } from './pages/Analytics';
import { Fleet } from './pages/Fleet';
import { Executive } from './pages/Executive';
import { Settings } from './pages/Settings';
import { DemoTourOverlay } from './components/demo/DemoTourOverlay';
import { useSimulationLoop } from './hooks/useSimulationLoop';

export const App: React.FC = () => {
  // Central digital twin simulation loop
  useSimulationLoop();

  return (
    <BrowserRouter>
      <DemoTourOverlay />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/digital-twin" element={<DigitalTwin />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/dynocard" element={<DynocardAnalysis />} />
          <Route path="/css-optimizer" element={<CSSOptimizer />} />
          <Route path="/srp-control" element={<SRPControl />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/executive" element={<Executive />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
