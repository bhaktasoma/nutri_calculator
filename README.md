# Nutrition Macro Calculator

A static nutrition macro calculator built for daily diet planning. No build step, no dependencies — pure HTML/CSS/JS.

Live demo: https://bhaktasoma.github.io/nutri_calculator/

## What it does

- Estimates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor formula, or the Katch-McArdle formula when an optional body fat % is provided.
- Adjusts BMR by activity level to compute Total Daily Energy Expenditure (TDEE).
- Provides a goal-adjusted calorie target and macro breakdown, visualized as a donut chart.
- Supports both imperial (lbs, ft/in) and metric (kg, cm) units via a toggle.
- Light/dark theme toggle with a persisted preference.

## How to use

1. Open `index.html` in your browser (or visit the live demo above).
2. Enter your age, gender, weight, and height — toggle units if you prefer kg/cm.
3. Optionally enter your body fat % for a more accurate BMR estimate.
4. Choose an activity level and goal, then press `Calculate`.

## Development

This is a plain static site — just open `index.html` directly, or serve it locally:

```sh
python3 -m http.server 8000
```

The calorie/macro math lives in `calc.js` as pure, dependency-free functions, separate from the DOM-wiring code in `script.js`. This keeps it testable with Node's built-in test runner:

```sh
npm test
```

## Notes

- This tool is an estimate and educational aid, not a substitute for medical or nutritional advice.
- For personalized plans, consult a registered dietitian or nutrition expert.
