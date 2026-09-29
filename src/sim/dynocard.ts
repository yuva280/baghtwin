import { DynacardPoint, DynacardData, FaultClass } from '../types';

/**
 * Dynacard Simulation Engine (Surface & Gibbs Downhole Reconstruction)
 */

export const DynacardEngine = {
  /**
   * Generates a 100-point closed-loop surface card
   * t goes from 0 to 2*PI (0 to 1 normalized stroke position)
   */
  generateSurfaceCard(fault: FaultClass, viscCp: number = 7420, _spm: number = 5.8): DynacardPoint[] {
    const points: DynacardPoint[] = [];
    const numPoints = 100;

    // Upstroke is 0 -> PI (position 0 to 1), Downstroke is PI -> 2*PI (position 1 to 0)
    for (let i = 0; i < numPoints; i++) {
      const theta = (i / numPoints) * 2 * Math.PI;
      const pos = 0.5 * (1 - Math.cos(theta)); // Normalized position 0 to 1

      let load = 0;
      const isUpstroke = theta < Math.PI;

      switch (fault) {
        case 'NORMAL': {
          if (isUpstroke) {
            // Load picks up rapidly at bottom of stroke to peak ~115 kN
            const pickup = Math.sin(theta);
            load = 70 + 44 * Math.pow(pickup, 0.45);
          } else {
            // Downstroke load drops to ~28 kN
            const drop = Math.sin(theta - Math.PI);
            load = 28 + 26 * Math.pow(Math.max(0, 1 - drop), 0.7);
          }
          // Slight viscous damping elevation
          load += (viscCp / 10000) * 3;
          break;
        }

        case 'ROD_FLOATING': {
          // Delayed downstroke pickup, inward lower-right sag, lowered minimum load
          if (isUpstroke) {
            load = 65 + 46 * Math.sin(theta * 0.95);
          } else {
            // Lower right sag due to buoyancy/viscous drag delaying rod descent
            const downstrokeProgress = (theta - Math.PI) / Math.PI;
            const sag = Math.sin(downstrokeProgress * Math.PI);
            load = 18 + 14 * (1 - downstrokeProgress) - 10 * sag;
          }
          break;
        }

        case 'FLUID_POUND': {
          if (isUpstroke) {
            load = 70 + 42 * Math.sin(theta);
          } else {
            // Sharp notch midway during downstroke as traveling valve hits fluid level abruptly
            const downstrokeProgress = (theta - Math.PI) / Math.PI;
            if (downstrokeProgress < 0.45) {
              load = 75 - downstrokeProgress * 30; // Suspended load
            } else {
              load = 28 + Math.sin(downstrokeProgress * Math.PI) * 8; // Abrupt drop
            }
          }
          break;
        }

        case 'GAS_INTERFERENCE': {
          if (isUpstroke) {
            // Slow gradual expansion curve rather than sharp rectangular corner
            load = 35 + 75 * Math.pow(pos, 1.8);
          } else {
            // Gas compression curve on downstroke
            load = 28 + 60 * Math.pow(1 - pos, 2.2);
          }
          break;
        }

        case 'TUBING_MOVEMENT': {
          // Tilted parallelogram due to unanchored tubing elongation
          if (isUpstroke) {
            load = 40 + 72 * pos;
          } else {
            load = 22 + 45 * pos;
          }
          break;
        }

        case 'UNSEATED_PUMP': {
          // Narrow horizontal friction strip
          load = 55 + 10 * Math.sin(theta) + (isUpstroke ? 6 : -6);
          break;
        }

        case 'PARTED_ROD': {
          // Collapsed low-load loop representing only rod string weight above parting depth
          load = 22 + 6 * Math.sin(theta);
          break;
        }

        default:
          load = 60 + 20 * Math.sin(theta);
      }

      // Add small high-frequency dynamometer telemetry noise
      const noise = (Math.sin(theta * 18) * 0.8) + (Math.cos(theta * 27) * 0.4);
      points.push({
        position: Math.round(pos * 1000) / 1000,
        load: Math.round((load + noise) * 10) / 10,
      });
    }

    return points;
  },

  /**
   * Section 39: Downhole Pump Card via Simulated Gibbs Wave Equation Reconstruction
   * Transforms surface card with phase shift, amplitude attenuation, and standing wave ripples
   */
  generateDownholeCard(surfaceCard: DynacardPoint[], fault: FaultClass): DynacardPoint[] {
    return surfaceCard.map((pt, idx) => {
      let downholeLoad = pt.load;

      if (fault === 'PARTED_ROD') {
        return { position: pt.position, load: 4.0 }; // Zero downhole resistance
      }

      // 1D wave dampening & corner sharpening
      if (pt.load > 65) {
        downholeLoad = 72 + (pt.load - 65) * 1.15; // Higher effective downhole peak
      } else {
        downholeLoad = Math.max(12, pt.load * 0.78); // Lower effective bottomhole minimum
      }

      // Damped standing wave ripple at pump barrel
      const waveRipple = Math.sin(idx * 0.4) * 2.2 * Math.exp(-idx / 60);

      return {
        position: pt.position,
        load: Math.round((downholeLoad + waveRipple) * 10) / 10,
      };
    });
  },

  /**
   * Section 41: Simulated 1D-CNN Fault Classifier Confidence
   */
  classifyDynacard(fault: FaultClass): {
    confidences: { name: string; probability: number }[];
    predictedFault: FaultClass;
    inferenceTimeMs: number;
  } {
    const baseProbs: Record<FaultClass, { name: string; probability: number }[]> = {
      NORMAL: [
        { name: 'Normal Full Pump', probability: 0.94 },
        { name: 'Rod Floating', probability: 0.03 },
        { name: 'Fluid Pound', probability: 0.02 },
        { name: 'Gas Interference', probability: 0.01 },
        { name: 'Parted Rod', probability: 0.0 },
      ],
      ROD_FLOATING: [
        { name: 'Rod Floating', probability: 0.91 },
        { name: 'Normal Full Pump', probability: 0.04 },
        { name: 'Fluid Pound', probability: 0.03 },
        { name: 'Gas Interference', probability: 0.02 },
        { name: 'Parted Rod', probability: 0.0 },
      ],
      FLUID_POUND: [
        { name: 'Fluid Pound', probability: 0.93 },
        { name: 'Gas Interference', probability: 0.04 },
        { name: 'Rod Floating', probability: 0.02 },
        { name: 'Normal Full Pump', probability: 0.01 },
        { name: 'Parted Rod', probability: 0.0 },
      ],
      GAS_INTERFERENCE: [
        { name: 'Gas Interference', probability: 0.89 },
        { name: 'Fluid Pound', probability: 0.07 },
        { name: 'Normal Full Pump', probability: 0.03 },
        { name: 'Rod Floating', probability: 0.01 },
        { name: 'Parted Rod', probability: 0.0 },
      ],
      PARTED_ROD: [
        { name: 'Parted Rod', probability: 0.98 },
        { name: 'Normal Full Pump', probability: 0.01 },
        { name: 'Rod Floating', probability: 0.01 },
        { name: 'Fluid Pound', probability: 0.0 },
        { name: 'Gas Interference', probability: 0.0 },
      ],
      TUBING_MOVEMENT: [
        { name: 'Tubing Movement', probability: 0.87 },
        { name: 'Normal Full Pump', probability: 0.08 },
        { name: 'Rod Floating', probability: 0.03 },
        { name: 'Fluid Pound', probability: 0.02 },
        { name: 'Parted Rod', probability: 0.0 },
      ],
      UNSEATED_PUMP: [
        { name: 'Unseated Pump', probability: 0.86 },
        { name: 'Parted Rod', probability: 0.08 },
        { name: 'Normal Full Pump', probability: 0.04 },
        { name: 'Fluid Pound', probability: 0.02 },
        { name: 'Rod Floating', probability: 0.0 },
      ],
    };

    return {
      confidences: baseProbs[fault] || baseProbs.NORMAL,
      predictedFault: fault,
      inferenceTimeMs: 12.4, // Simulated 1D-CNN runtime
    };
  },

  /**
   * Generates full dynacard dataset with surface, downhole, and simulated AI metrics
   */
  getDynacardData(fault: FaultClass, viscCp: number = 7420, spm: number = 5.8): DynacardData {
    const surface = this.generateSurfaceCard(fault, viscCp, spm);
    const downhole = this.generateDownholeCard(surface, fault);
    const classification = this.classifyDynacard(fault);

    return {
      surfaceCard: surface,
      downholeCard: downhole,
      faultClass: fault,
      confidence: classification.confidences[0].probability,
      inferenceTimeMs: classification.inferenceTimeMs,
      timestamp: new Date().toLocaleTimeString(),
    };
  },

  /**
   * Section 40: Smoothly morphs between two dynacard shapes over time
   */
  interpolateCards(fromCard: DynacardPoint[], toCard: DynacardPoint[], alpha: number): DynacardPoint[] {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    return fromCard.map((pt, i) => {
      const target = toCard[i] || pt;
      return {
        position: Math.round((pt.position * (1 - clampedAlpha) + target.position * clampedAlpha) * 1000) / 1000,
        load: Math.round((pt.load * (1 - clampedAlpha) + target.load * clampedAlpha) * 10) / 10,
      };
    });
  },
};
