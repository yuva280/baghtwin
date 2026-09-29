import { simulatorInstance } from '../sim/simulator';
import { useWellStore } from '../store/wellStore';
import { useSimulationStore } from '../store/simulationStore';
import { useAlertStore } from '../store/alertStore';
import { PhysicsEngine } from '../sim/physics';

export interface TourStep {
  id: number;
  stage: 'MONITOR' | 'PREDICT' | 'DETECT' | 'RECOMMEND' | 'CONTROL' | 'RECOVERY' | 'OPTIMIZE' | 'EXECUTIVE' | 'SURVEILLANCE';
  route: string;
  title: string;
  subtitle: string;
  description: string;
  technicalNote: string;
  durationSeconds: number;
  action: () => void;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    stage: 'MONITOR',
    route: '/',
    title: '1. Steady-State Heavy Oil Production (Baghewala Field)',
    subtitle: 'Thermal Inflow • Calibrated Physics Baseline',
    description: 'Well BGW-WELL-034 is operating in steady production on Day 14 following CSS steam injection. Reservoir temperature is ~56.4°C with heavy crude viscosity at ~7,420 cP. The SRP beam unit is pumping at 5.8 SPM with normal motor load (72%).',
    technicalNote: 'Basin Context: Baghewala Field produces 17–19° API extra-heavy crude with temperature-dependent viscosity modeled by Walther equation. Viscosity increases dramatically as formation heat dissipates.',
    durationSeconds: 8,
    action: () => {
      const wellStore = useWellStore.getState();
      const simStore = useSimulationStore.getState();
      const alertStore = useAlertStore.getState();

      simStore.setActiveFault(null);
      simStore.setOperatingMode('ADVISORY');
      simStore.setSimSpeed(1);
      wellStore.selectWell('BGW-WELL-034');
      simulatorInstance.setTargetSPM(5.8);

      const baselineTemp = 56.4;
      const baselineVisc = PhysicsEngine.calculateViscosity(baselineTemp);
      wellStore.updateCurrentWell({
        reservoirTempC: baselineTemp,
        viscosityCp: baselineVisc,
        spm: 5.8,
        motorLoadPct: 72,
        rodFloatingRisk: 0.22,
        pumpFillagePct: 84,
        anomalyScore: 0.12,
        faultClass: 'NORMAL',
      });
      alertStore.clearAll();
    },
  },
  {
    id: 2,
    stage: 'PREDICT',
    route: '/',
    title: '2. Reservoir Thermal Decline & Viscosity Surge',
    subtitle: 'PINN Thermal Model Forecast • Walther Viscosity',
    description: 'As steam energy dissipates into the formation (thermal decay τ = 9 days), the PINN thermal model forecasts reservoir cooling to 48.2°C. Viscosity surges past 11,200 cP, sharply escalating viscous friction on the downstroke.',
    technicalNote: 'Physics Law: Walther equation calibrated for Baghewala crude dictates that cooling from 56°C to 48°C causes a ~60% viscosity increase, elevating downstroke drag exponentially.',
    durationSeconds: 8,
    action: () => {
      const wellStore = useWellStore.getState();
      const alertStore = useAlertStore.getState();

      const coolTemp = 48.2;
      const highVisc = PhysicsEngine.calculateViscosity(coolTemp);
      const highLoad = PhysicsEngine.calculateMotorLoad(highVisc, 5.8);
      const highRisk = PhysicsEngine.calculateRodFloatingRisk(highVisc, 5.8, null);

      wellStore.updateCurrentWell({
        reservoirTempC: coolTemp,
        viscosityCp: highVisc,
        motorLoadPct: highLoad,
        rodFloatingRisk: highRisk,
        anomalyScore: 0.62,
      });

      alertStore.addAlert({
        id: `ALT-TOUR-COOL`,
        wellId: 'BGW-WELL-034',
        severity: 'WARNING',
        status: 'ACTIVE',
        title: 'Thermal Decline & Viscosity Escalation',
        message: `Reservoir cooled to ${coolTemp}°C. Viscosity escalated to ${highVisc.toLocaleString()} cP. Downstroke drag elevated.`,
        metric: 'viscosityCp',
        currentValue: highVisc,
        thresholdValue: 10000,
        timestamp: new Date().toLocaleTimeString(),
      });
    },
  },
  {
    id: 3,
    stage: 'DETECT',
    route: '/digital-twin',
    title: '3. Digital Twin Subsurface Wellbore Mechanics',
    subtitle: '1,150 m Wellbore Cross-Section • Sucker Rod Kinematics',
    description: 'The interactive well cross-section visualizes downhole mechanics. High viscous drag retards the sucker rod string fall during downstroke. The terminal fall velocity drops below plunger speed, inducing compressive rod buckling risk.',
    technicalNote: 'Mechanical Failure Mechanism: If rod fall velocity < beam polished rod velocity, the rod string enters axial compression, causing helical buckling, tubing wear, and eventual fatigue parting.',
    durationSeconds: 9,
    action: () => {
      const wellStore = useWellStore.getState();
      const simStore = useSimulationStore.getState();

      simStore.setActiveFault('ROD_FLOATING');
      wellStore.updateCurrentWell({
        faultClass: 'ROD_FLOATING',
        rodFloatingRisk: 0.78,
        motorLoadPct: 88,
        anomalyScore: 0.74,
      });
    },
  },
  {
    id: 4,
    stage: 'DETECT',
    route: '/dynocard',
    title: '4. 1D-CNN Dynacard Anomaly Classification',
    subtitle: 'Surface Load-Displacement & Gibbs Wave Reconstruction',
    description: 'The dynacard reveals characteristic inward lower-right sag and delayed traveling valve pickup. The simulated 1D-CNN classifier identifies Rod Floating at 92.4% confidence (12.4 ms inference latency).',
    technicalNote: 'Diagnostic Signature: In normal operation, valve seating occurs immediately at top-of-stroke. Rod floating delays load pickup until deep into the downstroke, compressing the dynacard work loop area.',
    durationSeconds: 9,
    action: () => {
      const wellStore = useWellStore.getState();
      const simStore = useSimulationStore.getState();
      const alertStore = useAlertStore.getState();

      simStore.setActiveFault('ROD_FLOATING');
      wellStore.updateCurrentWell({
        faultClass: 'ROD_FLOATING',
        rodFloatingRisk: 0.82,
        motorLoadPct: 89,
      });

      alertStore.addAlert({
        id: `ALT-TOUR-ROD`,
        wellId: 'BGW-WELL-034',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        title: 'Critical Rod Floating Condition Detected',
        message: '1D-CNN dynacard classifier detected delayed downstroke seating (Risk 82%). High compressive buckling hazard.',
        metric: 'rodFloatingRisk',
        currentValue: 0.82,
        thresholdValue: 0.85,
        timestamp: new Date().toLocaleTimeString(),
      });
    },
  },
  {
    id: 5,
    stage: 'RECOMMEND',
    route: '/srp-control',
    title: '5. Explainable AI Recommendation & Safety Guardrails',
    subtitle: 'Transparent Reasoning • Safety Interlocks Active',
    description: 'The Digital Twin generates an Explainable AI recommendation: "Trim SPM from 5.8 to 4.2 SPM to restore rod fall equilibrium." The hard rate limiter enforces a maximum rate of change of ±0.5 SPM/min to protect structural integrity.',
    technicalNote: 'Safety Architecture: The ±0.5 SPM/min limiter ensures that motor deceleration occurs smoothly over 3.2 minutes, preventing traveling valve hydraulic slap and rod string resonance.',
    durationSeconds: 8,
    action: () => {
      const alertStore = useAlertStore.getState();
      alertStore.addRecommendation({
        id: `REC-TOUR-SPM`,
        wellId: 'BGW-WELL-034',
        title: 'Controlled SPM Downward Optimization',
        description: 'Reservoir cooling has escalated crude viscosity to 11,450 cP. Downstroke viscous drag is retarding rod fall. Trimming SPM from 5.8 to 4.2 restores full valve seating and eliminates compressive buckling risk.',
        trigger: 'Reservoir Cooling → Viscosity Escalation → Rod Float Risk 82%',
        recommendedAction: 'Step down SPM setpoint from 5.8 to 4.2 (Max slew rate: ±0.5 SPM/min)',
        currentValue: 5.8,
        recommendedValue: 4.2,
        variable: 'SPM',
        confidence: 0.94,
        timestamp: new Date().toLocaleTimeString(),
        status: 'PENDING',
      });
    },
  },
  {
    id: 6,
    stage: 'CONTROL',
    route: '/srp-control',
    title: '6. Closed-Loop SPM Slewing via ±0.5 SPM/min Limiter',
    subtitle: 'Governor Rate Limiting • Live Slew Countdown',
    description: 'Operator accepts the AI recommendation. Target SPM is updated to 4.2. The hard safety rate limiter actively slews the motor speed smoothly at 0.00833 SPM/s, displayed by the live slewing badge.',
    technicalNote: 'Industrial Rigor: Sucker rod pump systems cannot change stroke rate instantly without causing polished rod floating or cyclic torsional stress on gearbox gears. Rate limiting is non-negotiable.',
    durationSeconds: 9,
    action: () => {
      const simStore = useSimulationStore.getState();
      const alertStore = useAlertStore.getState();

      simStore.setTargetSPM(4.2, 'Accepted AI Recommendation: Rod Float Mitigation', 'OPERATOR');
      alertStore.updateRecommendationStatus('REC-TOUR-SPM', 'ACCEPTED', 'OPERATOR');
    },
  },
  {
    id: 7,
    stage: 'RECOVERY',
    route: '/srp-control',
    title: '7. Mechanical Stress Mitigation & Recovery',
    subtitle: 'Risk Normalization • Motor Load Stabilized',
    description: 'As SPM reaches 4.2, the slower stroke velocity allows the rod string to fall freely through the viscous crude. Motor load drops to 69%, rod floating risk plummets to 0.21, pump fillage restores to 86%, and the card envelope normalizes.',
    technicalNote: 'Validation: Terminal velocity Stokes drag condition is satisfied: v_rod >= v_plunger. Compressive stress is eliminated and MTBF restores to 180 days.',
    durationSeconds: 8,
    action: () => {
      const wellStore = useWellStore.getState();
      const simStore = useSimulationStore.getState();
      const alertStore = useAlertStore.getState();

      simStore.setActiveFault(null);
      wellStore.updateCurrentWell({
        spm: 4.2,
        faultClass: 'NORMAL',
        motorLoadPct: 69,
        rodFloatingRisk: 0.21,
        anomalyScore: 0.14,
        pumpFillagePct: 86,
      });

      alertStore.clearAll();
    },
  },
  {
    id: 8,
    stage: 'OPTIMIZE',
    route: '/css-optimizer',
    title: '8. CSS Steam Cycle Optimization (NSGA-II)',
    subtitle: 'Multi-Objective Pareto Trade-Off • SOR Reduction',
    description: 'With surface pumping stabilized, the engineer optimizes the next CSS thermal cycle. The simulated NSGA-II optimizer identifies the Pareto candidate: 1,450 m³ steam at 85 bar with a 4-day soak, lowering SOR from 3.42 to 3.10 m³/m³.',
    technicalNote: 'Economic Efficiency: Over-injecting steam yields diminishing thermal returns. The optimizer balances net crude production against boiler fuel consumption, saving 420 m³ of steam per cycle.',
    durationSeconds: 9,
    action: () => {
      const wellStore = useWellStore.getState();
      wellStore.updateCurrentWell({
        steamInjectedM3: 1450,
        sor: 3.10,
      });
    },
  },
  {
    id: 9,
    stage: 'EXECUTIVE',
    route: '/executive',
    title: '9. Field Economics & Annual Value Realization',
    subtitle: '$636,000 / Year ROI • 3 Value Pillars • 4.2 Month Payback',
    description: 'Executive aggregation quantifies full field impact: 3 workovers averted ($126k/yr), -9.4% steam fuel savings ($198k/yr), and +4.2% heavy oil production ($312k/yr). Total annual benefit across Baghewala Field is $636,000.',
    technicalNote: 'OIL INDIA Value Case: Eliminating 3 sucker rod parting interventions saves 42 days of rig workover downtime, maintaining sustained thermal recovery momentum.',
    durationSeconds: 8,
    action: () => {
      // Navigates to /executive
    },
  },
  {
    id: 10,
    stage: 'SURVEILLANCE',
    route: '/fleet',
    title: '10. Centralized Field Fleet Surveillance (56 Wells)',
    subtitle: 'Field-Wide Turnkey Twin Scalability • Baghewala Basin',
    description: 'The AI Digital Twin scales effortlessly across all 56 thermal wells in Baghewala Field. Real-time telemetry synchronization, automated anomaly ranking, and safety interlocks empower operators to manage the entire asset from a single pane of glass.',
    technicalNote: 'Hackathon Grand Finale: The prototype demonstrates the full closed loop: Reservoir Cooling → Viscosity Surge → Rod Floating → 1D-CNN Anomaly → Safe Rate-Limited SPM Trim → CSS Optimization → Fleet ROI.',
    durationSeconds: 9,
    action: () => {
      // Navigates to /fleet
    },
  },
];
