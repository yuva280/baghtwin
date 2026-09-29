import { PhysicsEngine } from '../physics';
import { DynacardEngine } from '../dynocard';
import { simulatorInstance } from '../simulator';
import { generateSeedWells } from '../seedData';
import { DEFAULT_WELL_ID } from '../../constants';

console.log('--- 1. VERIFYING SEED WELLS (56 WELLS) ---');
const wells = generateSeedWells();
console.log('Total wells count:', wells.length);
const counts = wells.reduce((acc, w) => {
  acc[w.status] = (acc[w.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
console.log('Status distribution:', counts);

console.log('\n--- 2. VERIFYING THERMAL DECLINE & VISCOSITY RELATIONSHIP ---');
const t48Visc = PhysicsEngine.calculateViscosity(48.0);
const t56Visc = PhysicsEngine.calculateViscosity(56.4);
const t62Visc = PhysicsEngine.calculateViscosity(62.0);
const t68Visc = PhysicsEngine.calculateViscosity(68.0);
console.log(`Temp 48°C -> Viscosity: ${t48Visc} cP (Target: 11,500-12,500 cP)`);
console.log(`Temp 56.4°C -> Viscosity: ${t56Visc} cP`);
console.log(`Temp 62°C -> Viscosity: ${t62Visc} cP (Target: ~5,000 cP)`);
console.log(`Temp 68°C -> Viscosity: ${t68Visc} cP`);

console.log('\n--- 3. VERIFYING SRP MECHANICS & ROD FLOATING RISK ---');
const riskLow = PhysicsEngine.calculateRodFloatingRisk(5000, 4.5, null);
const riskHigh = PhysicsEngine.calculateRodFloatingRisk(11800, 6.2, null);
const motorLow = PhysicsEngine.calculateMotorLoad(5000, 4.2);
const motorHigh = PhysicsEngine.calculateMotorLoad(11800, 6.2);
console.log(`Hot oil (5,000 cP) @ 4.5 SPM -> Rod Floating Risk: ${riskLow}, Motor Load: ${motorLow}%`);
console.log(`Cold oil (11,800 cP) @ 6.2 SPM -> Rod Floating Risk: ${riskHigh}, Motor Load: ${motorHigh}%`);

console.log('\n--- 4. VERIFYING SPM RATE LIMITER (±0.5 SPM/min) ---');
const spm1 = PhysicsEngine.applySPMRateLimiter(6.0, 4.0, 1.0); // 1 sec elapsed
const spm60 = PhysicsEngine.applySPMRateLimiter(6.0, 4.0, 60.0); // 60 sec elapsed
console.log(`Current: 6.0 SPM, Target: 4.0 SPM. After 1s: ${spm1} SPM (Delta: ${(6.0 - spm1).toFixed(4)})`);
console.log(`Current: 6.0 SPM, Target: 4.0 SPM. After 60s: ${spm60} SPM (Delta: ${(6.0 - spm60).toFixed(2)})`);

console.log('\n--- 5. VERIFYING DYNACARDS & 1D-CNN INFERENCE ---');
const dynaNormal = DynacardEngine.getDynacardData('NORMAL', 7420, 5.8);
const dynaFloating = DynacardEngine.getDynacardData('ROD_FLOATING', 11500, 6.0);
console.log(`Normal Card points: ${dynaNormal.surfaceCard.length}, Confidence: ${dynaNormal.confidence}, Inference: ${dynaNormal.inferenceTimeMs}ms`);
console.log(`Rod Floating Card points: ${dynaFloating.surfaceCard.length}, Confidence: ${dynaFloating.confidence}`);

console.log('\n--- 6. VERIFYING CENTRAL SIMULATOR STEP ---');
const defaultWell = wells.find(w => w.id === DEFAULT_WELL_ID)!;
const stepResult = simulatorInstance.step(defaultWell, 1.0, 1.0, 'ADVISORY', true, null);
console.log('Simulated step executed successfully. Updated Well SPM:', stepResult.updatedWell.spm, 'Motor Load:', stepResult.updatedWell.motorLoadPct);
