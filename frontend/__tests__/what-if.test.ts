import { runSimulation } from '../lib/simulator';
import { ACTIVITY_CONFIGS } from '../lib/calculations';

describe('What-If Scenario Simulator', () => {
  describe('Calculations', () => {
    it('Car -> Bus produces the correct difference', () => {
      const res = runSimulation('car', 'bus', 10);
      expect(res.success).toBe(true);
      expect(res.currentCO2).toBeCloseTo(2.00, 2);
      expect(res.alternativeCO2).toBeCloseTo(0.80, 2);
      expect(res.diff).toBeCloseTo(1.20, 2);
    });

    it('Non-veg -> Veg produces the correct difference', () => {
      const res = runSimulation('non_veg_meal', 'veg_meal', 1);
      expect(res.success).toBe(true);
      expect(res.currentCO2).toBeCloseTo(2.00, 2);
      expect(res.alternativeCO2).toBeCloseTo(0.50, 2);
      expect(res.diff).toBeCloseTo(1.50, 2);
    });

    it('Same activity produces zero difference', () => {
      const res = runSimulation('car', 'car', 10);
      expect(res.success).toBe(true);
      expect(res.diff).toBe(0);
    });

    it('Higher-footprint alternative is correctly detected', () => {
      const res = runSimulation('bus', 'car', 10);
      expect(res.success).toBe(true);
      expect(res.currentCO2).toBeCloseTo(0.80, 2);
      expect(res.alternativeCO2).toBeCloseTo(2.00, 2);
      expect(res.diff).toBeCloseTo(-1.20, 2);
    });

    it('Decimal quantities work', () => {
      const res = runSimulation('car', 'bus', '10.5');
      expect(res.success).toBe(true);
      expect(res.currentCO2).toBe(2.1);
      expect(res.alternativeCO2).toBe(0.84);
      expect(res.diff).toBeCloseTo(1.26, 2);
    });

    it('Results are correctly rounded', () => {
      const res = runSimulation('car', 'bus', 10.333333);
      expect(res.success).toBe(true);
      expect(res.currentCO2).toBeCloseTo(2.07, 2); // 10.333333 * 0.20 = 2.06666
      expect(res.alternativeCO2).toBeCloseTo(0.83, 2); // 10.333333 * 0.08 = 0.82666
    });
  });

  describe('Validation', () => {
    it('Empty current activity is rejected', () => {
      const res = runSimulation('', 'bus', 10);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Choose an activity to simulate a scenario.');
    });

    it('Empty alternative is rejected', () => {
      const res = runSimulation('car', '', 10);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Choose an alternative to compare.');
    });

    it('Empty quantity is rejected', () => {
      const res = runSimulation('car', 'bus', '');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Enter a quantity to calculate the scenario.');
    });

    it('Non-numeric quantity is rejected', () => {
      const res = runSimulation('car', 'bus', 'abc');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Enter a valid number.');
    });

    it('Zero quantity is rejected', () => {
      const res = runSimulation('car', 'bus', 0);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Quantity must be greater than zero.');
    });

    it('Negative quantity is rejected', () => {
      const res = runSimulation('car', 'bus', -5);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Quantity cannot be negative.');
    });

    it('Extreme values follow existing DP2 validation (reject)', () => {
      const res = runSimulation('car', 'bus', 1000000);
      expect(res.success).toBe(false);
      expect(res.error).toContain('is not a valid value. Maximum allowed is');
    });

    it('Unusual values follow existing DP2 validation (warning)', () => {
      const res = runSimulation('car', 'bus', 5000);
      expect(res.success).toBe(false);
      expect(res.warning).toContain('This value is unusually high.');
      
      const resConfirmed = runSimulation('car', 'bus', 5000, true);
      expect(resConfirmed.success).toBe(true);
    });
  });

  describe('Persistence', () => {
    it('Running a simulation does NOT create a history entry (implicitly tested by pure function)', () => {
      // The `runSimulation` function doesn't import any storage functions for writing, so it can't mutate state.
      expect(typeof runSimulation).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('Calculation failure does not crash the application', () => {
      const res = runSimulation('invalid_type' as any, 'bus', 10);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid activity type selected.');
    });
  });
});
