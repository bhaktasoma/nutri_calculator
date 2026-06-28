const LBS_PER_KG = 2.20462262185;
const CM_PER_INCH = 2.54;

function lbsToKg(lbs) {
  return lbs / LBS_PER_KG;
}

function kgToLbs(kg) {
  return kg * LBS_PER_KG;
}

function feetInchesToCm(feet, inches) {
  return (feet * 12 + inches) * CM_PER_INCH;
}

function cmToFeetInches(cm) {
  const totalInches = cm / CM_PER_INCH;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}

function calculateBMRMifflin(weightKg, heightCm, age, gender) {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

function calculateBMRKatchMcArdle(weightKg, bodyFatPct) {
  const leanMassKg = weightKg * (1 - bodyFatPct / 100);
  return 370 + 21.6 * leanMassKg;
}

function computeBMR({ weightKg, heightCm, age, gender, bodyFatPct }) {
  if (bodyFatPct !== null && bodyFatPct !== undefined && !Number.isNaN(bodyFatPct)) {
    return {
      bmr: calculateBMRKatchMcArdle(weightKg, bodyFatPct),
      method: 'Katch-McArdle',
    };
  }
  return {
    bmr: calculateBMRMifflin(weightKg, heightCm, age, gender),
    method: 'Mifflin-St Jeor',
  };
}

function formatNumber(value, decimals = 0) {
  return Number(value.toFixed(decimals)).toLocaleString('en-US');
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
      advice: 'Keep steady calories and focus on consistency.',
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
        strength: 'Keep lifting heavy and preserve strength while lowering calories.',
      },
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
        strength: 'Focus on progressive overload and gradual strength improvements.',
      },
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
        strength: 'Track consistent strength progress on compound lifts.',
      },
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    lbsToKg,
    kgToLbs,
    feetInchesToCm,
    cmToFeetInches,
    calculateBMRMifflin,
    calculateBMRKatchMcArdle,
    computeBMR,
    formatNumber,
    goalAdjustments,
    calculateMacros,
  };
}
