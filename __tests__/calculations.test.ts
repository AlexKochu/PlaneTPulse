// ============================================================
// PlanetPulse — Unit Tests for CO₂ Calculation Engine
// ============================================================
// Run with: npx jest (or: npx ts-node __tests__/calculations.test.ts)
// ============================================================

import { calculateCO2, ACTIVITY_CONFIGS, ACTIVITY_TYPES } from '../lib/calculations';
import { validateActivityInput } from '../lib/validation';

// ============================================================
// Calculation Tests
// ============================================================
describe('calculateCO2', () => {
  test('car: 10 km = 2.00 kg CO₂', () => {
    const result = calculateCO2('car', 10);
    expect(result.co2Kg).toBe(2.00);
    expect(result.factor).toBe(0.20);
    expect(result.unit).toBe('km');
  });

  test('bus: 10 km = 0.80 kg CO₂', () => {
    const result = calculateCO2('bus', 10);
    expect(result.co2Kg).toBe(0.80);
    expect(result.factor).toBe(0.08);
    expect(result.unit).toBe('km');
  });

  test('flight: 10 km = 2.50 kg CO₂', () => {
    const result = calculateCO2('flight', 10);
    expect(result.co2Kg).toBe(2.50);
    expect(result.factor).toBe(0.25);
    expect(result.unit).toBe('km');
  });

  test('electricity: 5 kWh = 4.00 kg CO₂', () => {
    const result = calculateCO2('electricity', 5);
    expect(result.co2Kg).toBe(4.00);
    expect(result.factor).toBe(0.80);
    expect(result.unit).toBe('kWh');
  });

  test('veg meal: 2 meals = 1.00 kg CO₂', () => {
    const result = calculateCO2('veg_meal', 2);
    expect(result.co2Kg).toBe(1.00);
    expect(result.factor).toBe(0.50);
    expect(result.unit).toBe('meals');
  });

  test('non-veg meal: 3 meals = 6.00 kg CO₂', () => {
    const result = calculateCO2('non_veg_meal', 3);
    expect(result.co2Kg).toBe(6.00);
    expect(result.factor).toBe(2.00);
    expect(result.unit).toBe('meals');
  });

  test('decimal quantities: car 7.5 km = 1.50 kg CO₂', () => {
    const result = calculateCO2('car', 7.5);
    expect(result.co2Kg).toBe(1.50);
  });

  test('decimal quantities: electricity 12.3 kWh = 9.84 kg CO₂', () => {
    const result = calculateCO2('electricity', 12.3);
    expect(result.co2Kg).toBe(9.84);
  });

  test('large quantity: flight 1000 km = 250.00 kg CO₂', () => {
    const result = calculateCO2('flight', 1000);
    expect(result.co2Kg).toBe(250.00);
  });

  test('quantity of 1: each activity', () => {
    expect(calculateCO2('car', 1).co2Kg).toBe(0.20);
    expect(calculateCO2('bus', 1).co2Kg).toBe(0.08);
    expect(calculateCO2('flight', 1).co2Kg).toBe(0.25);
    expect(calculateCO2('electricity', 1).co2Kg).toBe(0.80);
    expect(calculateCO2('veg_meal', 1).co2Kg).toBe(0.50);
    expect(calculateCO2('non_veg_meal', 1).co2Kg).toBe(2.00);
  });

  test('throws for unknown activity type', () => {
    expect(() => calculateCO2('bicycle' as any, 10)).toThrow('Unknown activity type');
  });

  test('all six activity types are defined', () => {
    expect(ACTIVITY_TYPES).toHaveLength(6);
    expect(ACTIVITY_TYPES).toContain('car');
    expect(ACTIVITY_TYPES).toContain('bus');
    expect(ACTIVITY_TYPES).toContain('flight');
    expect(ACTIVITY_TYPES).toContain('electricity');
    expect(ACTIVITY_TYPES).toContain('veg_meal');
    expect(ACTIVITY_TYPES).toContain('non_veg_meal');
  });

  test('emission factors match hackathon spec exactly', () => {
    expect(ACTIVITY_CONFIGS.car.emissionFactor).toBe(0.20);
    expect(ACTIVITY_CONFIGS.bus.emissionFactor).toBe(0.08);
    expect(ACTIVITY_CONFIGS.flight.emissionFactor).toBe(0.25);
    expect(ACTIVITY_CONFIGS.electricity.emissionFactor).toBe(0.80);
    expect(ACTIVITY_CONFIGS.veg_meal.emissionFactor).toBe(0.50);
    expect(ACTIVITY_CONFIGS.non_veg_meal.emissionFactor).toBe(2.00);
  });
});

// ============================================================
// Validation Tests (DP2)
// ============================================================
describe('validateActivityInput', () => {
  test('rejects empty activity type', () => {
    const result = validateActivityInput('', '10');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('select an activity');
  });

  test('rejects empty quantity', () => {
    const result = validateActivityInput('car', '');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('enter a quantity');
  });

  test('rejects non-numeric input', () => {
    const result = validateActivityInput('car', 'abc');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('valid number');
  });

  test('rejects negative quantity', () => {
    const result = validateActivityInput('car', '-5');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('greater than zero');
  });

  test('rejects zero quantity', () => {
    const result = validateActivityInput('car', '0');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('greater than zero');
  });

  test('rejects Infinity', () => {
    const result = validateActivityInput('car', Infinity);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('finite');
  });

  test('rejects absurd car value (500000 km)', () => {
    const result = validateActivityInput('car', '500000');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not a valid value');
  });

  test('warns on unusual but plausible car value (2000 km)', () => {
    const result = validateActivityInput('car', '2000');
    expect(result.valid).toBe(true);
    expect(result.requiresConfirmation).toBe(true);
    expect(result.confirmationMessage).toContain('unusually high');
  });

  test('accepts normal car value (10 km)', () => {
    const result = validateActivityInput('car', '10');
    expect(result.valid).toBe(true);
    expect(result.requiresConfirmation).toBeUndefined();
  });

  test('accepts normal veg meal (3 meals)', () => {
    const result = validateActivityInput('veg_meal', '3');
    expect(result.valid).toBe(true);
  });

  test('rejects absurd meal count (150 meals)', () => {
    const result = validateActivityInput('veg_meal', '150');
    expect(result.valid).toBe(false);
  });

  test('warns on unusual meal count (25 meals)', () => {
    const result = validateActivityInput('non_veg_meal', '25');
    expect(result.valid).toBe(true);
    expect(result.requiresConfirmation).toBe(true);
  });

  test('flight allows large but not absurd values', () => {
    // 10000 km is a normal long-haul flight - should pass
    const normal = validateActivityInput('flight', '10000');
    expect(normal.valid).toBe(true);
    expect(normal.requiresConfirmation).toBeUndefined();

    // 60000 km is absurd - should reject
    const absurd = validateActivityInput('flight', '60000');
    expect(absurd.valid).toBe(false);
  });

  test('accepts decimal quantities', () => {
    const result = validateActivityInput('electricity', '7.5');
    expect(result.valid).toBe(true);
  });
});
