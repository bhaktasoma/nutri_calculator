import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  lbsToKg,
  kgToLbs,
  feetInchesToCm,
  cmToFeetInches,
  calculateBMRMifflin,
  calculateBMRKatchMcArdle,
  computeBMR,
  goalAdjustments,
  calculateMacros,
} from '../calc.js';

test('lbsToKg / kgToLbs round-trip', () => {
  const lbs = 180;
  const kg = lbsToKg(lbs);
  assert.ok(Math.abs(kg - 81.6466) < 0.001);
  assert.ok(Math.abs(kgToLbs(kg) - lbs) < 0.0001);
});

test('feetInchesToCm converts 5ft 3in correctly', () => {
  const cm = feetInchesToCm(5, 3);
  assert.ok(Math.abs(cm - 160.02) < 0.01);
});

test('cmToFeetInches round-trips feetInchesToCm', () => {
  const cm = feetInchesToCm(5, 10);
  const { feet, inches } = cmToFeetInches(cm);
  assert.equal(feet, 5);
  assert.equal(inches, 10);
});

test('cmToFeetInches handles inch rollover to next foot', () => {
  const { feet, inches } = cmToFeetInches(feetInchesToCm(5, 12));
  assert.equal(feet, 6);
  assert.equal(inches, 0);
});

test('calculateBMRMifflin matches known female value', () => {
  const bmr = calculateBMRMifflin(80, 165, 30, 'female');
  assert.ok(Math.abs(bmr - (10 * 80 + 6.25 * 165 - 5 * 30 - 161)) < 1e-9);
});

test('calculateBMRMifflin matches known male value', () => {
  const bmr = calculateBMRMifflin(80, 178, 30, 'male');
  assert.ok(Math.abs(bmr - (10 * 80 + 6.25 * 178 - 5 * 30 + 5)) < 1e-9);
});

test('calculateBMRKatchMcArdle uses lean mass from body fat %', () => {
  const bmr = calculateBMRKatchMcArdle(80, 20);
  assert.ok(Math.abs(bmr - (370 + 21.6 * (80 * 0.8))) < 1e-9);
});

test('computeBMR falls back to Mifflin-St Jeor when body fat % is absent', () => {
  const result = computeBMR({ weightKg: 80, heightCm: 178, age: 30, gender: 'male', bodyFatPct: null });
  assert.equal(result.method, 'Mifflin-St Jeor');
});

test('computeBMR uses Katch-McArdle when body fat % is provided', () => {
  const result = computeBMR({ weightKg: 80, heightCm: 178, age: 30, gender: 'male', bodyFatPct: 15 });
  assert.equal(result.method, 'Katch-McArdle');
  assert.ok(Math.abs(result.bmr - calculateBMRKatchMcArdle(80, 15)) < 1e-9);
});

test('goalAdjustments returns maintenance by default for unknown goal', () => {
  const adj = goalAdjustments('not-a-real-goal', 2000);
  assert.equal(adj.label, 'Maintenance');
  assert.equal(adj.calories, 2000);
});

test('goalAdjustments fat_loss reduces calories by 15%', () => {
  const adj = goalAdjustments('fat_loss', 2000);
  assert.ok(Math.abs(adj.calories - 1700) < 1e-9);
});

test('goalAdjustments macro percentages sum to 1 for every goal', () => {
  for (const goal of ['maintenance', 'fat_loss', 'lean_gain', 'bulking']) {
    const adj = goalAdjustments(goal, 2000);
    const sum = adj.proteinPct + adj.fatPct + adj.carbPct;
    assert.ok(Math.abs(sum - 1) < 1e-9, `${goal} macro percentages should sum to 1`);
  }
});

test('calculateMacros splits calories correctly across protein/fat/carbs', () => {
  const macros = calculateMacros(2000, 0.25, 0.30, 0.45);
  assert.ok(Math.abs(macros.protein - 125) < 1e-9);
  assert.ok(Math.abs(macros.fat - 66.667) < 0.001);
  assert.ok(Math.abs(macros.carbs - 225) < 1e-9);
});

test('calculateMacros gram totals reconstruct the original calories', () => {
  const macros = calculateMacros(2400, 0.3, 0.25, 0.45);
  const reconstructed = macros.protein * 4 + macros.fat * 9 + macros.carbs * 4;
  assert.ok(Math.abs(reconstructed - 2400) < 1e-9);
});
