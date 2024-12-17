# Atlas Frontend

This is the frontend repository for the Atlas travel itinerary planner.

## Introduction

Atlas is a travel itinerary planner designed to help users effortlessly plan their travels with friends and loved ones. The app provides all the tools needed to organize trips, manage events, and collaborate with others.

**Made by:** Kristian Diaz, Kent Dulangon, Pia Tantay - BS Computer Science II

## Core Features

- Event Management
- Shared Calendars
- Real-time Notifications
- User Authentication
- Responsive Design

## Setup and Installation

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone <https://github.com/kin-kkoy/Atlas-Frontend.git>
   cd Atlas-FrontEnd/TravelItineraryPlanner   ```

2. Install dependencies:

   The following Node modules are required:

   - `axios`
   - `bootstrap`
   - `intl-tel-input`
   - `prop-types`
   - `react`
   - `react-bootstrap`
   - `react-calendar`
   - `react-dom`
   - `react-icons`
   - `react-router-dom`
   - `socket.io-client`
  
   If an error "Failed to resolve import "intl-tel-input" from "src/LandingPage.jsx". Does the     file exist?" pops up (see image below)
![image](https://github.com/user-attachments/assets/e9204dec-1977-4c7b-84e6-d83039087bc5)

   Run: 
   ```bash 
   npm uninstall intl-tel-input
   npm i intl-tel-input@latest   ```


   Install them using:
   ```bash
   npm install   ```

3. Run the development server:
   ```bash
   npm run dev   ```

   The frontend will be available at `http://localhost:5173`.

## Screenshots

![image](https://github.com/user-attachments/assets/29889659-b9bc-4bd6-8bc1-16bc9a78ec7a)
![image](https://github.com/user-attachments/assets/304e650f-4c7b-4a06-9202-04b6888efdd1)
![image](https://github.com/user-attachments/assets/c1c43aa0-0863-4686-9e41-d3bdf3540fb3)



