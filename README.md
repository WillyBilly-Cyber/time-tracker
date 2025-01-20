# WillBilly5000 Daily Time Tracker

## About the App
The "WillBilly5000 Daily Time Tracker" is a productivity-focused app that allows individuals to track their daily activities, general tasks, and specific project work. Its intuitive interface ensures seamless time management and reporting.

## Key Features
- **Day Timer**: Record time spent throughout the day.
- **General Timer**: Track general task durations.
- **Project Timers**: Manage and log time for individual projects.
- **Time Adjustments**: Transfer time between timers dynamically.
- **Export to CSV**: Generate detailed reports in CSV format.

## Setup Instructions
### Prerequisites
- Node.js and npm installed on your system.

### Steps to Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/WillyBilly-Cyber/time-tracker.git
   cd time-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

5. To build for production:
   ```bash
   npm run build
   ```

## How It Works
The app uses React with Next.js, Tailwind CSS for styling, and TypeScript for type safety. It features:
1. **Timers**: Incremental counters for tracking day, general, and project times.
2. **Dynamic Buttons**: Buttons change color based on state (e.g., green for active, red for stop).
3. **Time Adjustments**: Add or subtract time between timers in 5-minute increments.
4. **CSV Export**: Download time logs for analysis.

## License
MIT License
