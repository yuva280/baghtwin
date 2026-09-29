import React from 'react';
import { CONSTANTS, FIELD_NAME, ORG_NAME } from '../../constants';
import { useWellStore } from '../../store/wellStore';

export const Footer: React.FC = () => {
  const { currentWell } = useWellStore();

  return (
    <footer className="h-7 bg-bg-panel border-t border-border px-3 flex items-center justify-between text-[11px] font-mono text-text-muted select-none">
      <div className="flex items-center space-x-3">
        <span className="text-text-secondary font-medium">{ORG_NAME} — {FIELD_NAME}</span>
      </div>

      <div className="flex items-center space-x-3 text-[10px]">
        {currentWell && (
          <>
            <span>DEPTH: <strong className="text-text-secondary font-mono">{currentWell.depthM} m</strong></span>
            <span>API: <strong className="text-text-secondary font-mono">{currentWell.apiGravity}°</strong></span>
            <span>T_BASE: <strong className="text-text-secondary font-mono">{CONSTANTS.T_BASE}°C</strong></span>
          </>
        )}
      </div>
    </footer>
  );
};
