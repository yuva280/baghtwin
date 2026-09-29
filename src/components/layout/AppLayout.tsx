import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { useSimulationStore } from '../../store/simulationStore';

export const AppLayout: React.FC = () => {
  const { isProjectorMode } = useSimulationStore();

  useEffect(() => {
    if (isProjectorMode) {
      document.documentElement.classList.add('projector-mode');
    } else {
      document.documentElement.classList.remove('projector-mode');
    }
  }, [isProjectorMode]);

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-bg text-text-primary ${isProjectorMode ? 'projector-mode' : ''}`}>
      {/* Persistent Industrial Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Control Bar */}
        <TopBar />

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 bg-tech-grid bg-bg">
          <Outlet />
        </main>

        {/* Industrial Footer */}
        <Footer />
      </div>
    </div>
  );
};
