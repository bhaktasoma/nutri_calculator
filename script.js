const THEME_KEY = 'nutri-calculator-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const toggle = document.getElementById('themeToggle');
  const isDark = theme === 'dark';
  toggle.setAttribute('aria-pressed', String(isDark));
  toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const preferred = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(preferred);

  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

const form = document.getElementById('calc-form');
const resultsSection = document.getElementById('results');
const bmrValue = document.getElementById('bmrValue');
const bmrMethod = document.getElementById('bmrMethod');
const tdeeValue = document.getElementById('tdeeValue');
const goalValue = document.getElementById('goalValue');
const targetValue = document.getElementById('targetValue');
const proteinValue = document.getElementById('proteinValue');
const fatValue = document.getElementById('fatValue');
const carbValue = document.getElementById('carbValue');
const proteinPctLabel = document.getElementById('proteinPctLabel');
const fatPctLabel = document.getElementById('fatPctLabel');
const carbPctLabel = document.getElementById('carbPctLabel');
const macroDonut = document.getElementById('macroDonut');
const donutCalories = document.getElementById('donutCalories');
const macroSplitValue = document.getElementById('macroSplitValue');
const goalTimeline = document.getElementById('goalTimeline');
const goalAdvice = document.getElementById('goalAdvice');
const weightBenchmark = document.getElementById('weightBenchmark');
const bodyFatBenchmark = document.getElementById('bodyFatBenchmark');
const strengthBenchmark = document.getElementById('strengthBenchmark');
const nextStep = document.getElementById('nextStep');
const customTimeframe = document.getElementById('customTimeframe');

const weightInput = document.getElementById('weight');
const weightLabel = document.getElementById('weightLabel');
const weightUnitToggle = document.getElementById('weightUnitToggle');
const heightUnitToggle = document.getElementById('heightUnitToggle');
const heightFtIn = document.getElementById('heightFtIn');
const heightCmGroup = document.getElementById('heightCmGroup');
const heightFeetInput = document.getElementById('heightFeet');
const heightInchesInput = document.getElementById('heightInches');
const heightCmInput = document.getElementById('heightCm');
const bodyFatPctInput = document.getElementById('bodyFatPct');

let weightUnit = 'lbs';
let heightUnit = 'ftin';

function initUnitToggle(container, onChange) {
  container.addEventListener('click', (event) => {
    const button = event.target.closest('.unit-btn');
    if (!button || button.classList.contains('active')) return;
    container.querySelectorAll('.unit-btn').forEach((btn) => btn.classList.toggle('active', btn === button));
    onChange(button.dataset.unit);
  });
}

initUnitToggle(weightUnitToggle, (unit) => {
  const currentValue = Number(weightInput.value);
  if (unit === 'kg' && weightUnit === 'lbs') {
    weightInput.value = lbsToKg(currentValue).toFixed(1);
    weightInput.min = '32';
    weightInput.max = '180';
    weightLabel.textContent = 'Weight (kg)';
  } else if (unit === 'lbs' && weightUnit === 'kg') {
    weightInput.value = kgToLbs(currentValue).toFixed(1);
    weightInput.min = '70';
    weightInput.max = '400';
    weightLabel.textContent = 'Weight (lbs)';
  }
  weightUnit = unit;
});

initUnitToggle(heightUnitToggle, (unit) => {
  if (unit === heightUnit) return;
  if (unit === 'cm') {
    const cm = feetInchesToCm(Number(heightFeetInput.value), Number(heightInchesInput.value));
    heightCmInput.value = cm.toFixed(1);
    heightFtIn.hidden = true;
    heightCmGroup.hidden = false;
    heightFeetInput.required = false;
    heightInchesInput.required = false;
    heightCmInput.required = true;
  } else {
    const { feet, inches } = cmToFeetInches(Number(heightCmInput.value));
    heightFeetInput.value = feet;
    heightInchesInput.value = inches;
    heightFtIn.hidden = false;
    heightCmGroup.hidden = true;
    heightFeetInput.required = true;
    heightInchesInput.required = true;
    heightCmInput.required = false;
  }
  heightUnit = unit;
});

function getWeightKg() {
  const value = Number(weightInput.value);
  return weightUnit === 'kg' ? value : lbsToKg(value);
}

function getHeightCm() {
  if (heightUnit === 'cm') {
    return Number(heightCmInput.value);
  }
  return feetInchesToCm(Number(heightFeetInput.value), Number(heightInchesInput.value));
}

function renderDonut(macros) {
  const proteinEnd = macros.proteinPct * 100;
  const fatEnd = proteinEnd + macros.fatPct * 100;
  macroDonut.style.background = `conic-gradient(var(--protein) 0% ${proteinEnd}%, var(--fat) ${proteinEnd}% ${fatEnd}%, var(--carb) ${fatEnd}% 100%)`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const age = Number(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const activityFactor = Number(document.getElementById('activity').value);
  const goal = document.getElementById('goal').value;
  const bodyFatRaw = bodyFatPctInput.value.trim();
  const bodyFatPct = bodyFatRaw === '' ? null : Number(bodyFatRaw);

  const weightKg = getWeightKg();
  const heightCm = getHeightCm();
  const { bmr, method } = computeBMR({ weightKg, heightCm, age, gender, bodyFatPct });
  const tdee = bmr * activityFactor;
  const adjustments = goalAdjustments(goal, tdee);
  const selectedWeeks = Number(customTimeframe.value) || 0;
  const customTimeline = selectedWeeks >= 2 ? `${selectedWeeks} weeks` : adjustments.timeline;
  const nextStepMessage = selectedWeeks >= 2
    ? `Follow this plan for ${selectedWeeks} weeks, then re-evaluate your metrics.`
    : `Track your progress weekly and reassess after the recommended period.`;
  const macros = calculateMacros(adjustments.calories, adjustments.proteinPct, adjustments.fatPct, adjustments.carbPct);

  bmrValue.textContent = formatNumber(bmr, 0);
  bmrMethod.textContent = method;
  tdeeValue.textContent = formatNumber(tdee, 0);
  goalValue.textContent = adjustments.label;
  targetValue.textContent = formatNumber(adjustments.calories, 0);
  donutCalories.textContent = formatNumber(adjustments.calories, 0);
  proteinValue.textContent = formatNumber(macros.protein, 0);
  fatValue.textContent = formatNumber(macros.fat, 0);
  carbValue.textContent = formatNumber(macros.carbs, 0);
  proteinPctLabel.textContent = `${Math.round(macros.proteinPct * 100)}%`;
  fatPctLabel.textContent = `${Math.round(macros.fatPct * 100)}%`;
  carbPctLabel.textContent = `${Math.round(macros.carbPct * 100)}%`;
  macroSplitValue.textContent = macros.split;
  weightBenchmark.textContent = adjustments.benchmarks?.weight || 'Use consistent tracking.';
  bodyFatBenchmark.textContent = adjustments.benchmarks?.bodyFat || 'Use consistent tracking.';
  strengthBenchmark.textContent = adjustments.benchmarks?.strength || 'Use consistent tracking.';
  goalTimeline.textContent = selectedWeeks >= 2 ? customTimeline : adjustments.timeline;
  goalAdvice.textContent = adjustments.advice;
  nextStep.textContent = nextStepMessage;

  resultsSection.hidden = false;
  renderDonut(macros);
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

initTheme();
