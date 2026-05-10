# ⚡ Streak Forge

A minimal, powerful, browser-based productivity dashboard designed to help you build discipline through consistency. Streak Forge allows you to track focus sessions, analyze your work-life balance, log workouts and nutrition, and monitor finances—all in a sleek, modern SaaS interface.

Everything runs entirely locally in your browser, with all data saved safely via `localStorage`.

## ✨ Features

### 📊 Activity Tracking & Focus Mode
- **Categorized Activities**: Manage activities by categorizing them as **Productive** or **Entertainment**. 
- **Zen Focus Timer**: A distraction-free floating timer to log your focus sessions, including support for breaks.
- **Balance Insights**: Real-time feedback calculating the ratio between your productive time and entertainment time, plus intelligent break analytics.
- **Activity Streaks**: Maintain daily streaks for activities you log consistently.
- **Productivity Graph**: A stacked HTML Canvas bar chart visualizing your daily productive vs. entertainment hours.

### 🏋️ Exercise & Nutrition Tracking
- **Workout Logging**: Log daily routines with sets and reps, tracking the most performed exercises.
- **Hydration Tracking**: Quickly log glasses of water and monitor daily hydration times.
- **Meal Logging**: Track your meals with smart categorization (High Protein, Balanced Meal, Junk Food, etc.), complete with visual health indicators.
- **Routine Management**: Add your own custom exercises and assign them to categories, or archive old ones without losing historical data.

### 💰 Financial Dashboard
- **Intelligent Budgeting**: Set category budgets and watch real-time progress bars update as you log expenses.
- **Dynamic Income Sources**: Track multiple income streams and see their exact percentage contribution to your total income.
- **Expense Tracking**: Log daily transactions seamlessly. The system automatically calculates Total Income, Total Expenses, Remaining Balance, and % Income Spent.

## 🛠️ Technology Stack
- **React**: Component-based UI architecture.
- **Vite**: Ultra-fast frontend tooling.
- **Vanilla CSS**: Custom sleek UI with interactive hover states and responsive layouts without heavy frameworks.
- **Lucide React**: Beautiful, consistent iconography.
- **Data Persistence**: Utilizes `localStorage` (`streakForgeDataV3`) for entirely private, offline data storage.

## 🚀 How to Run

1. Clone this repository to your local machine.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and start tracking!
