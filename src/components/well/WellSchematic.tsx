import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Droplet, 
  Layers, 
  Activity, 
  Zap, 
  Info
} from 'lucide-react';
import { Well, FaultClass } from '../../types';

interface WellSchematicProps {
  well: Well;
  activeFault: FaultClass | null;
}

export type ViewMode = 'THERMAL' | 'PRESSURE' | 'VISCOSITY' | 'FLOW';

export const WellSchematic: React.FC<WellSchematicProps> = ({ well, activeFault }) => {
  const [mode, setMode] = useState<ViewMode>('THERMAL');
  const [animTime, setAnimTime] = useState<number>(0);

  // Animation clock for beam walking movement and flow particles
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      // Advance animation angle proportional to current well SPM
      if (well.spm > 0) {
        setAnimTime((prev) => prev + delta * (well.spm / 60) * 2 * Math.PI);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [well.spm]);

  // Current walking beam angle (oscillates ~ -12° to +12°)
  const beamAngle = well.spm > 0 ? Math.sin(animTime) * 11 : 0;
  // Polished rod displacement (-22px to +22px)
  const rodOffset = well.spm > 0 ? Math.sin(animTime) * 24 : 0;

  // Thermal chamber color & radius based on reservoir temperature
  const tempRatio = Math.max(0, Math.min(1, (well.reservoirTempC - 46) / (72 - 46)));
  const chamberRadius = 24 + tempRatio * 32; // 24px to 56px
  const chamberColor =
    tempRatio > 0.65 ? '#F59E0B' : tempRatio > 0.35 ? '#FB923C' : '#60A5FA';

  const fault = activeFault || well.faultClass;

  return (
    <div className="panel-scada p-3 rounded flex flex-col space-y-3">
      {/* 1. Header with Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-status-cyan" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            Wellbore & Reservoir Cross-Section Digital Twin (1,150 m)
          </h2>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-status-cyan/15 text-status-cyan border border-status-cyan/30">
            {well.id} • {well.cyclePhase}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-bg-inset border border-border p-0.5 rounded text-xs font-mono">
          <span className="text-[10px] text-text-muted px-2">OVERLAY:</span>
          {(['THERMAL', 'PRESSURE', 'VISCOSITY', 'FLOW'] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                mode === m
                  ? m === 'THERMAL'
                    ? 'bg-status-warning/20 border border-status-warning/60 text-status-warning shadow'
                    : m === 'PRESSURE'
                    ? 'bg-status-blue/20 border border-status-blue/60 text-status-blue shadow'
                    : m === 'VISCOSITY'
                    ? 'bg-status-violet/20 border border-status-violet/60 text-status-violet shadow'
                    : 'bg-status-cyan/20 border border-status-cyan/60 text-status-cyan shadow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Schematic SVG Canvas */}
      <div className="relative w-full aspect-[16/9] min-h-[460px] bg-bg-inset rounded border border-border overflow-hidden select-none">
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradients for overlays */}
            <linearGradient id="thermalWellbore" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="pressureWellbore" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="viscosityWellbore" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.3" />
            </linearGradient>

            {/* Radial glow for steam heated reservoir chamber */}
            <radialGradient id="heatChamberGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={chamberColor} stopOpacity="0.75" />
              <stop offset="40%" stopColor={chamberColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0B0E11" stopOpacity="0" />
            </radialGradient>

            {/* Metallic gradients */}
            <linearGradient id="steelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#303A46" />
              <stop offset="50%" stopColor="#8B94A3" />
              <stop offset="100%" stopColor="#1F2630" />
            </linearGradient>

            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#0E7490" />
            </linearGradient>
          </defs>

          {/* ======================================================== */}
          {/* SECTION A: DEPTH RULER (Left Axis: 0m to 1,150m)        */}
          {/* ======================================================== */}
          <g transform="translate(45, 0)">
            <line x1="40" y1="120" x2="40" y2="580" stroke="#303A46" strokeWidth="2" />
            {[
              { m: 0, y: 120, label: '0 m (Surface Wellhead)' },
              { m: 200, y: 200, label: '200 m (Surface Casing)' },
              { m: 400, y: 280, label: '400 m (VIT Annulus)' },
              { m: 600, y: 360, label: '600 m (Intermediate Csg)' },
              { m: 800, y: 440, label: '800 m (Heavy Crude)' },
              { m: 1000, y: 520, label: '1,000 m (Production Csg)' },
              { m: 1150, y: 580, label: '1,150 m (Perforations)' },
            ].map((mark) => (
              <g key={mark.m}>
                <line x1="32" y1={mark.y} x2="48" y2={mark.y} stroke="#22D3EE" strokeWidth="1.5" />
                <text
                  x="26"
                  y={mark.y + 3}
                  fill="#8B94A3"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {mark.label}
                </text>
              </g>
            ))}
          </g>

          {/* ======================================================== */}
          {/* SECTION B: GEOLOGICAL STRATA BACKGROUND                  */}
          {/* ======================================================== */}
          {/* Surface Ground Terrain */}
          <rect x="180" y="118" width="800" height="4" fill="#5F6875" />
          <line x1="180" y1="120" x2="980" y2="120" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 2" />
          <text x="960" y="114" fill="#8B94A3" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
            RAJASTHAN ARID FORMATION • GROUND LEVEL
          </text>

          {/* Upper Overburden Strata (120 to 520) */}
          <rect x="260" y="122" width="700" height="400" fill="#0F1318" opacity="0.6" />

          {/* Target Heavy Oil Sandstone Reservoir (520 to 600) */}
          <rect x="260" y="522" width="700" height="88" fill="#14181D" stroke="#303A46" strokeWidth="1" />
          <text x="960" y="540" fill="#F59E0B" fontSize="10" fontFamily="JetBrains Mono" textAnchor="end">
            BAGHEWALA JODHPUR HEAVY OIL SANDSTONE (18.2° API)
          </text>

          {/* Thermal Diffusion Heat Chamber (Reservoir Glow around Perforations) */}
          <ellipse
            cx="480"
            cy="565"
            rx={chamberRadius * 3.4}
            ry={chamberRadius * 0.9}
            fill="url(#heatChamberGlow)"
          />

          {/* ======================================================== */}
          {/* SECTION C: CASING & VACUUM INSULATED TUBING (VIT)        */}
          {/* ======================================================== */}
          {/* Outer Surface / Production Casing (Width: 84px) */}
          <rect x="438" y="122" width="84" height="448" fill="#14181D" stroke="#303A46" strokeWidth="2" />

          {/* Inner Vacuum Insulated Tubing (VIT) (Width: 44px) */}
          <rect
            x="458"
            y="122"
            width="44"
            height="440"
            fill={
              mode === 'THERMAL'
                ? 'url(#thermalWellbore)'
                : mode === 'PRESSURE'
                ? 'url(#pressureWellbore)'
                : mode === 'VISCOSITY'
                ? 'url(#viscosityWellbore)'
                : '#0F1318'
            }
            stroke="#8B94A3"
            strokeWidth="1.5"
          />

          {/* Flow Particles / Vectors (When in FLOW or Production Phase) */}
          {well.cyclePhase === 'PRODUCTION' && well.spm > 0 && (
            <g>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const yPos = 540 - (((animTime * 35 + i * 65) % 410));
                return (
                  <circle
                    key={i}
                    cx="480"
                    cy={yPos}
                    r="2.5"
                    fill="#22D3EE"
                    opacity="0.85"
                  />
                );
              })}
            </g>
          )}

          {/* Steam Flow Downward Particles during INJECTION */}
          {well.cyclePhase === 'INJECTION' && (
            <g>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const yPos = 130 + (((animTime * 45 + i * 75) % 420));
                return (
                  <circle
                    key={i}
                    cx="480"
                    cy={yPos}
                    r="3.5"
                    fill="#F59E0B"
                    opacity="0.9"
                  />
                );
              })}
            </g>
          )}

          {/* ======================================================== */}
          {/* SECTION D: SUCKER ROD STRING & DOWNHOLE PUMP             */}
          {/* ======================================================== */}
          {/* Reciprocating Sucker Rod String (Center at X=480) */}
          {fault === 'PARTED_ROD' ? (
            // Parted Rod String (Discontinuity at depth ~600m / Y=360)
            <g>
              <line x1="480" y1={122 + rodOffset} x2="480" y2={340} stroke="#EF4444" strokeWidth="3.5" />
              {/* Parted Jagged Fracture Indicator */}
              <path d="M 476 340 L 484 344 L 476 348 L 484 352" stroke="#EF4444" strokeWidth="2" fill="none" />
              <text x="500" y="348" fill="#EF4444" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                ⚠ STRING PARTED AT 580m
              </text>
              <line x1="480" y1="362" x2="480" y2="550" stroke="#5F6875" strokeWidth="3" strokeDasharray="3 3" />
            </g>
          ) : (
            // Continuous Rod String with slight compression buckling if Rod Floating
            <g>
              {fault === 'ROD_FLOATING' ? (
                // Sinuous wave representing compressive rod buckling
                <path
                  d={`M 480 ${122 + rodOffset} 
                     Q 486 220 480 300 
                     Q 474 380 480 460 
                     L 480 550`}
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  fill="none"
                />
              ) : (
                <line
                  x1="480"
                  y1={122 + rodOffset}
                  x2="480"
                  y2={550 + rodOffset * 0.4}
                  stroke="url(#steelGradient)"
                  strokeWidth="3.5"
                />
              )}
            </g>
          )}

          {/* Downhole Plunger Pump Assembly (Y=550 to 580) */}
          <g transform={`translate(0, ${fault === 'PARTED_ROD' ? 0 : rodOffset * 0.4})`}>
            {/* Working Barrel */}
            <rect x="466" y="546" width="28" height="28" fill="#1F2630" stroke="#22D3EE" strokeWidth="1.5" />
            {/* Traveling Valve Ball */}
            <circle cx="480" cy="554" r="3.5" fill="#22C55E" />
            {/* Standing Valve Ball */}
            <circle cx="480" cy="570" r="3.5" fill="#3B82F6" />
          </g>

          {/* Casing Perforations (Into Sandstone) */}
          {[-12, -6, 0, 6, 12].map((dy) => (
            <g key={dy}>
              <line x1="432" y1={565 + dy} x2="442" y2={565 + dy} stroke="#F59E0B" strokeWidth="2.5" />
              <line x1="518" y1={565 + dy} x2="528" y2={565 + dy} stroke="#F59E0B" strokeWidth="2.5" />
            </g>
          ))}

          {/* ======================================================== */}
          {/* SECTION E: SURFACE PUMPING UNIT (NODDING DONKEY BEAM)    */}
          {/* Pivot Fulcrum at (X=360, Y=58)                           */}
          {/* ======================================================== */}
          {/* Samson Post Support Legs */}
          <line x1="330" y1="120" x2="360" y2="58" stroke="#5F6875" strokeWidth="4" />
          <line x1="390" y1="120" x2="360" y2="58" stroke="#5F6875" strokeWidth="4" />
          <line x1="345" y1="90" x2="375" y2="90" stroke="#303A46" strokeWidth="2.5" />

          {/* Samson Post Fulcrum Bearing */}
          <circle cx="360" cy="58" r="5" fill="#22D3EE" stroke="#1F2630" strokeWidth="2" />

          {/* Rocking Walking Beam Group (Rotates around Pivot (360, 58)) */}
          <g transform={`rotate(${beamAngle}, 360, 58)`}>
            {/* Main Walking Beam */}
            <polygon
              points="230,52 470,52 474,64 230,64"
              fill="url(#beamGradient)"
              stroke="#0B0E11"
              strokeWidth="1.5"
            />

            {/* Horse Head (Curved Arc at Right End: X=470) */}
            <path
              d="M 465 52 Q 492 56 480 115 L 468 110 Q 478 68 460 64 Z"
              fill="#1F2630"
              stroke="#22D3EE"
              strokeWidth="1.5"
            />

            {/* Pitman Arm Connection at Left End (X=238) */}
            <circle cx="238" cy="58" r="4" fill="#F59E0B" />
          </g>

          {/* Electric Prime Mover Motor & Gearbox Base (Left: X=210, Y=115) */}
          <rect x="200" y="100" width="45" height="20" fill="#14181D" stroke="#303A46" strokeWidth="1.5" />
          <circle cx="222" cy="110" r="6" fill="#F59E0B" />

          {/* Counterweight Rotating Crank (X=238, Y=95) */}
          <circle cx="238" cy="98" r="14" fill="none" stroke="#303A46" strokeDasharray="3 3" />
          <line
            x1="238"
            y1="98"
            x2={238 + Math.cos(animTime) * 12}
            y2={98 + Math.sin(animTime) * 12}
            stroke="#F59E0B"
            strokeWidth="3"
          />

          {/* Pitman Arm (Connects Beam Left End to Crank) */}
          <line
            x1={360 + Math.cos((beamAngle * Math.PI) / 180) * (238 - 360) - Math.sin((beamAngle * Math.PI) / 180) * 0}
            y1={58 + Math.sin((beamAngle * Math.PI) / 180) * (238 - 360) + Math.cos((beamAngle * Math.PI) / 180) * 0}
            x2={238 + Math.cos(animTime) * 12}
            y2={98 + Math.sin(animTime) * 12}
            stroke="#8B94A3"
            strokeWidth="2.5"
          />

          {/* Polished Rod Bridle / Wireline Hangs from Horse Head to Stuffing Box */}
          <line
            x1="480"
            y1={92 + beamAngle * 1.8}
            x2="480"
            y2={122 + rodOffset}
            stroke="#E6EAF0"
            strokeWidth="2"
          />

          {/* Wellhead Christmas Tree & Stuffing Box */}
          <rect x="472" y="112" width="16" height="10" fill="#303A46" stroke="#22D3EE" strokeWidth="1.5" />
          {/* Surface Flowline */}
          <line x1="488" y1="116" x2="540" y2="116" stroke="#22D3EE" strokeWidth="3" />
          <text x="546" y="119" fill="#22D3EE" fontSize="8" fontFamily="JetBrains Mono">
            PROD FLOWLINE ▶
          </text>

          {/* ======================================================== */}
          {/* SECTION F: CALLOUT TELEMETRY BOXES                       */}
          {/* ======================================================== */}
          {/* 1. Surface Beam Unit Callout */}
          <g transform="translate(600, 30)">
            <rect x="0" y="0" width="220" height="68" rx="4" fill="#14181D" stroke="#303A46" strokeWidth="1" />
            <text x="10" y="16" fill="#8B94A3" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
              SURFACE ARTIFICIAL LIFT UNIT
            </text>
            <text x="10" y="32" fill="#E6EAF0" fontSize="11" fontFamily="JetBrains Mono">
              SPM: <strong className="text-status-cyan">{well.spm.toFixed(1)}</strong> • VFD: {well.vfdHz.toFixed(1)} Hz
            </text>
            <text x="10" y="46" fill="#E6EAF0" fontSize="11" fontFamily="JetBrains Mono">
              Motor Load: <strong className={well.motorLoadPct > 85 ? 'text-status-warning' : 'text-status-healthy'}>{well.motorLoadPct.toFixed(1)}%</strong> • {well.motorTorque} N·m
            </text>
            <text x="10" y="60" fill="#8B94A3" fontSize="9" fontFamily="JetBrains Mono">
              Stroke Length: {well.strokeLengthM}m • Polished Rod: {well.polishedRodLoadKn.toFixed(1)} kN
            </text>
          </g>

          {/* 2. Annulus & Pressure Callout */}
          <g transform="translate(600, 220)">
            <rect x="0" y="0" width="220" height="64" rx="4" fill="#14181D" stroke="#303A46" strokeWidth="1" />
            <text x="10" y="16" fill="#8B94A3" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
              WELLBORE ANNULUS & TUBING
            </text>
            <text x="10" y="32" fill="#E6EAF0" fontSize="11" fontFamily="JetBrains Mono">
              Tubing Head: <strong className="text-status-blue">{well.tubingPressureBar.toFixed(1)} bar</strong>
            </text>
            <text x="10" y="46" fill="#E6EAF0" fontSize="11" fontFamily="JetBrains Mono">
              Casing Head: <strong className="text-text-secondary">{well.casingPressureBar.toFixed(1)} bar</strong>
            </text>
            <text x="10" y="58" fill="#8B94A3" fontSize="9" fontFamily="JetBrains Mono">
              VIT Insulation: Vacuum Grade Annular Seal
            </text>
          </g>

          {/* 3. Downhole Pump & Formation Callout */}
          <g transform="translate(600, 480)">
            <rect x="0" y="0" width="230" height="84" rx="4" fill="#14181D" stroke="#303A46" strokeWidth="1" />
            <text x="10" y="16" fill="#8B94A3" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
              DOWNHOLE PUMP & RESERVOIR (1,150 m)
            </text>
            <text x="10" y="32" fill="#E6EAF0" fontSize="11" fontFamily="JetBrains Mono">
              Reservoir Temp: <strong className="text-status-warning">{well.reservoirTempC.toFixed(1)}°C</strong>
            </text>
            <text x="10" y="48" fill="#E6EAF0" fontSize="11" fontFamily="JetBrains Mono">
              Viscosity: <strong className="text-status-violet">{well.viscosityCp.toLocaleString()} cP</strong>
            </text>
            <text x="10" y="64" fill="#E6EAF0" fontSize="11" fontFamily="JetBrains Mono">
              Fillage: <strong className="text-status-healthy">{well.pumpFillagePct.toFixed(0)}%</strong> • Intake: {well.pumpIntakePressureBar.toFixed(1)} bar
            </text>
            <text x="10" y="78" fill="#F59E0B" fontSize="9" fontFamily="JetBrains Mono">
              Thermal Chamber Radius: {well.heatRadiusM} m
            </text>
          </g>

          {/* Fault Indicator Banner (If Injected) */}
          {fault && fault !== 'NORMAL' && (
            <g transform="translate(240, 20)">
              <rect x="0" y="0" width="280" height="28" rx="4" fill="#EF4444" fillOpacity="0.2" stroke="#EF4444" strokeWidth="1.5" />
              <text x="10" y="18" fill="#EF4444" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                ⚠ {fault.replace('_', ' ')} FAULT ACTIVE IN WELLBORE
              </text>
            </g>
          )}
        </svg>

        {/* Floating Mode Description Overlay Badge */}
        <div className="absolute bottom-3 left-3 bg-bg-panel/90 backdrop-blur-xs border border-border px-3 py-1.5 rounded text-[11px] font-mono space-y-0.5 pointer-events-none">
          <div className="flex items-center space-x-1.5 text-text-primary font-bold">
            <Info className="w-3.5 h-3.5 text-status-cyan" />
            <span>ACTIVE OVERLAY: {mode}</span>
          </div>
          <p className="text-text-muted text-[10px]">
            {mode === 'THERMAL' && 'Visualizes thermal decline gradient from 30°C at surface to heated bottomhole chamber.'}
            {mode === 'PRESSURE' && 'Visualizes hydrostatic & flow gradient from 4.8 bar casing to 32.4 bar pump intake.'}
            {mode === 'VISCOSITY' && 'Visualizes severe heavy-crude viscous resistance profile along the rod string.'}
            {mode === 'FLOW' && (well.cyclePhase === 'INJECTION' ? 'Downward high-pressure steam flow particles.' : 'Upward produced heavy oil vectors.')}
          </p>
        </div>
      </div>

      {/* 3. Subsurface Engineering Footprint Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-bg-inset p-2.5 rounded border border-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-text-muted">TOTAL DEPTH</div>
            <div className="text-sm font-bold text-text-primary">{well.depthM} m</div>
            <div className="text-[9px] text-text-secondary">True Vertical Depth</div>
          </div>
          <Activity className="w-4 h-4 text-status-cyan" />
        </div>

        <div className="bg-bg-inset p-2.5 rounded border border-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-text-muted">CRUDE API GRAVITY</div>
            <div className="text-sm font-bold text-status-warning">{well.apiGravity}° API</div>
            <div className="text-[9px] text-text-secondary">Baghewala Heavy Crude</div>
          </div>
          <Droplet className="w-4 h-4 text-status-warning" />
        </div>

        <div className="bg-bg-inset p-2.5 rounded border border-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-text-muted">HEAT CHAMBER</div>
            <div className="text-sm font-bold text-status-healthy">{well.heatRadiusM} m Radius</div>
            <div className="text-[9px] text-text-secondary">Cycle Day {well.cycleDay.toFixed(1)}</div>
          </div>
          <Flame className="w-4 h-4 text-status-healthy" />
        </div>

        <div className="bg-bg-inset p-2.5 rounded border border-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-text-muted">MECHANICAL HARMONICS</div>
            <div className="text-sm font-bold text-status-violet">{(well.spm / 60).toFixed(2)} Hz</div>
            <div className="text-[9px] text-text-secondary">Walking Beam Frequency</div>
          </div>
          <Zap className="w-4 h-4 text-status-violet" />
        </div>
      </div>
    </div>
  );
};
