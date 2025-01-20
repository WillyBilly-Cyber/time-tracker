# WillBilly5000 Daily Time Tracker

## About the App
App Creator: WillBilly-Cyber

Purpose:
The "WillBilly5000 Daily Time Tracker" is a productivity-focused app designed to streamline time management. This tool allows individuals and teams to track day-to-day tasks, manage project time, and adjust timers dynamically.

Mission:
To empower users with an intuitive, interactive, and visually appealing tool for efficiently managing their time and projects. This app is ideal for developers, designers, freelancers, or anyone who needs to keep an accurate record of their time usage.

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

Detailed Description of How the Program Works

Application Structure

The app is built with React and Next.js, utilizing TypeScript for type safety. It employs Tailwind CSS for styling and uses state management via React hooks.

Main Components:

Day Timer: Tracks the total time spent during the day. It can be started, stopped, reset, and adjusted in increments of 5 minutes.

General Timer: Tracks time spent on general tasks. Time can be transferred to/from the Day Timer.

Project Management:

Add projects with a unique name.

Start/stop individual project timers.

Transfer time between the General Timer and specific project timers.

Export to CSV: Allows users to export all timer data in CSV format, including timestamps.

Core Functionalities:

State Management:

useState hooks manage the timer states for day, general, and project timers.

Dynamic updates ensure real-time functionality.

Timer Logic:

useEffect manages intervals for running timers.

Timers increment every second while running.

Dynamic Button States:

Buttons change colors based on state (e.g., green for active timers, red for stop buttons).

Disabled states are dynamically applied to prevent invalid actions.

Responsive UI:

Built using Tailwind CSS for consistent and responsive styling.

Time Adjustment Logic:

Time is transferred between timers using transferTimeGeneralDay and transferTimeProjectGeneral functions.

Add or subtract 5-minute intervals (300 seconds) as needed.
## License
MIT License
