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
const tdeeValue = document.getElementById('tdeeValue');
const goalValue = document.getElementById('goalValue');
const targetValue = document.getElementById('targetValue');
const proteinValue = document.getElementById('proteinValue');
const fatValue = document.getElementById('fatValue');
const carbValue = document.getElementById('carbValue');
const proteinBar = document.getElementById('proteinBar');
const fatBar = document.getElementById('fatBar');
const carbBar = document.getElementById('carbBar');
const macroSplitValue = document.getElementById('macroSplitValue');
const goalTimeline = document.getElementById('goalTimeline');
const goalAdvice = document.getElementById('goalAdvice');
const weightBenchmark = document.getElementById('weightBenchmark');
const bodyFatBenchmark = document.getElementById('bodyFatBenchmark');
const strengthBenchmark = document.getElementById('strengthBenchmark');
const nextStep = document.getElementById('nextStep');
const customTimeframe = document.getElementById('customTimeframe');

function lbsToKg(lbs) {
  return lbs * 0.45359237;
}

function heightToCm(feet, inches) {
  return feet * 30.48 + inches * 2.54;
}

function calculateBMR(weightKg, heightCm, age, gender) {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

function formatNumber(value, decimals = 0) {
  return Number(value.toFixed(decimals)).toLocaleString();
}

function goalAdjustments(goal, tdee) {
  const adjustments = {
    maintenance: {
      calories: tdee,
      proteinPct: 0.25,
      fatPct: 0.30,
      carbPct: 0.45,
      label: 'Maintenance',
      timeline: 'Review progress every 4 weeks.',
      advice: 'Keep steady calories and focus on consistency.'
    },
    fat_loss: {
      calories: tdee * 0.85,
      proteinPct: 0.30,
      fatPct: 0.30,
      carbPct: 0.40,
      label: 'Fat loss / Shredding',
      timeline: 'Follow for 6–12 weeks, then reassess.',
      advice: 'Track body composition and maintain protein intake to preserve lean mass.',
      benchmarks: {
        weight: 'Aim for 0.5–1 lb of fat loss per week.',
        bodyFat: 'Expect about 0.5–1% body fat reduction per month.',
        strength: 'Keep lifting heavy and preserve strength while lowering calories.'
      }
    },
    lean_gain: {
      calories: tdee * 1.08,
      proteinPct: 0.30,
      fatPct: 0.25,
      carbPct: 0.45,
      label: 'Lean muscle build',
      timeline: 'Use for 8–16 weeks while monitoring strength gains.',
      advice: 'Pair with resistance training and team up moderate calorie surplus with quality protein.',
      benchmarks: {
        weight: 'Aim for 0.25–0.5 lb gain per week.',
        bodyFat: 'Body fat should stay stable to slightly improve with lean muscle gain.',
        strength: 'Focus on progressive overload and gradual strength improvements.'
      }
    },
    bulking: {
      calories: tdee * 1.15,
      proteinPct: 0.28,
      fatPct: 0.28,
      carbPct: 0.44,
      label: 'Bulking',
      timeline: 'Use for 8–12 weeks, then switch to maintenance or lean gain.',
      advice: 'Focus on steady gains and avoid too large a calorie surplus.',
      benchmarks: {
        weight: 'Aim for 0.75–1.25 lb gain per week.',
        bodyFat: 'Expect a small body fat increase as you build mass.',
        strength: 'Track consistent strength progress on compound lifts.'
      }
    },
  };

  return adjustments[goal] || adjustments.maintenance;
}

function calculateMacros(calories, proteinPct, fatPct, carbPct) {
  const proteinCalories = calories * proteinPct;
  const fatCalories = calories * fatPct;
  const carbCalories = calories * carbPct;

  return {
    protein: proteinCalories / 4,
    fat: fatCalories / 9,
    carbs: carbCalories / 4,
    proteinPct,
    fatPct,
    carbPct,
    split: `Protein ${Math.round(proteinPct * 100)}%, Fat ${Math.round(fatPct * 100)}%, Carbs ${Math.round(carbPct * 100)}%`,
  };
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const age = Number(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const weightLbs = Number(document.getElementById('weight').value);
  const heightFeet = Number(document.getElementById('heightFeet').value);
  const heightInches = Number(document.getElementById('heightInches').value);
  const activityFactor = Number(document.getElementById('activity').value);
  const goal = document.getElementById('goal').value;

  const weightKg = lbsToKg(weightLbs);
  const heightCm = heightToCm(heightFeet, heightInches);
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = bmr * activityFactor;
  const adjustments = goalAdjustments(goal, tdee);
  const selectedWeeks = Number(customTimeframe.value) || 0;
  const customTimeline = selectedWeeks >= 2 ? `${selectedWeeks} weeks` : adjustments.timeline;
  const nextStepMessage = selectedWeeks >= 2
    ? `Follow this plan for ${selectedWeeks} weeks, then re-evaluate your metrics.`
    : `Track your progress weekly and reassess after the recommended period.`;
  const macros = calculateMacros(adjustments.calories, adjustments.proteinPct, adjustments.fatPct, adjustments.carbPct);

  bmrValue.textContent = formatNumber(bmr, 0);
  tdeeValue.textContent = formatNumber(tdee, 0);
  goalValue.textContent = adjustments.label;
  targetValue.textContent = formatNumber(adjustments.calories, 0);
  proteinValue.textContent = formatNumber(macros.protein, 0);
  fatValue.textContent = formatNumber(macros.fat, 0);
  carbValue.textContent = formatNumber(macros.carbs, 0);
  macroSplitValue.textContent = macros.split;
  weightBenchmark.textContent = adjustments.benchmarks?.weight || 'Use consistent tracking.';
  bodyFatBenchmark.textContent = adjustments.benchmarks?.bodyFat || 'Use consistent tracking.';
  strengthBenchmark.textContent = adjustments.benchmarks?.strength || 'Use consistent tracking.';
  goalTimeline.textContent = selectedWeeks >= 2 ? customTimeline : adjustments.timeline;
  goalAdvice.textContent = adjustments.advice;
  nextStep.textContent = nextStepMessage;

  resultsSection.hidden = false;
  proteinBar.style.width = '0%';
  fatBar.style.width = '0%';
  carbBar.style.width = '0%';
  requestAnimationFrame(() => {
    proteinBar.style.width = `${Math.round(macros.proteinPct * 100)}%`;
    fatBar.style.width = `${Math.round(macros.fatPct * 100)}%`;
    carbBar.style.width = `${Math.round(macros.carbPct * 100)}%`;
  });

  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

initTheme();
