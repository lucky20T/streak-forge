# ⚡ Streak Forge

A minimal, powerful, browser-based dashboard designed to help you build discipline through consistency. Streak Forge allows you to track focus sessions, analyze your work-life balance, log calisthenics workouts, and monitor finances—all in a sleek, dark-themed interface inspired by Notion and Discord.

Everything runs entirely in your browser using Vanilla HTML, CSS, and JavaScript, with all data saved safely via `localStorage`.

## ✨ Features

### 📊 Activity Tracking & Focus Mode
- **Categorized Activities**: Manage activities by categorizing them as **Productive** or **Entertainment**. 
- **Zen Focus Timer**: A distraction-free overlay timer to log your focus sessions, including support for breaks and session goals.
- **Balance Insights**: Real-time feedback calculating the ratio between your productive time and entertainment time.
- **Activity Streaks**: Maintain daily streaks for productive activities.
- **Productivity Graph**: A minimal 7-day HTML canvas bar chart visualizing your total productive hours.

### 🏋️ Calisthenics Exercise Logging
- **Comprehensive Library**: Pre-loaded with 29 default calisthenics exercises categorized into **Push, Pull, Legs, Core, Cardio, Skill, and Mobility**.
- **Sets & Reps Tracker**: Quickly log your daily workouts using a categorized dropdown menu.
- **Daily Stats**: Instantly see your total distinct exercises, total sets, and total reps for the day.
- **Weekly Progress**: A dedicated 7-day HTML canvas chart visualizing your accumulated total reps for the week.
- **Custom Exercises**: Add your own custom exercises and assign them to categories, or archive old ones without losing historical data.

### 💰 Financial Tracking
- **Income Tracker**: A minimal widget to quickly edit and track your monthly income or allowance.

## 🛠️ Technology Stack
- **HTML5**: Semantic structure.
- **Vanilla CSS**: Custom dark mode UI with interactive hover states and responsive layout without heavy frameworks.
- **Vanilla JavaScript**: Pure ES6+ JS handling state management, timer logic, DOM manipulation, and dynamic HTML Canvas rendering.
- **Data Persistence**: Utilizes `localStorage` (`streakForgeDataV3`) with seamless migration paths from previous versions.

## 🚀 How to Run
1. Clone this repository to your local machine.
2. Open `index.html` in any modern web browser.
3. Start tracking!

No Node.js, no build tools, no servers required. It works completely offline.
