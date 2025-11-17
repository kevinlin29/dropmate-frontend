# DropMate Frontend

A responsive React application for tracking packages and viewing live driver locations.

## Features

- **Responsive Design**: Adaptive layout for mobile, tablet, and desktop screens
- **Real-time Updates**: WebSocket integration for live shipment status updates
- **Package Tracking**: Track multiple packages by tracking number
- **Live Driver Location**: View real-time driver location updates (polling every 5s)
- **Status History**: Timeline view of shipment events and status changes

## Tech Stack

- React 19
- Vite (Rolldown)
- Socket.io Client
- CSS Grid with responsive media queries

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Running DropMate backend API on `http://localhost:8080`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:

Edit the `.env` file and add your Google Maps API key:

```bash
# Backend API URL
VITE_API_URL=http://localhost:8080/api

# Google Maps API Key (required for map display)
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

**To get a Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select an existing one
3. Enable the "Maps JavaScript API"
4. Go to Credentials and create an API key
5. Copy the API key and paste it in your `.env` file

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── AddPackageModal.jsx    # Modal for adding new packages to track
│   ├── DriverMap.jsx           # Live driver location display
│   ├── PackageInfo.jsx         # Package details and status history
│   └── PackageList.jsx         # List of tracked packages
├── services/
│   └── api.js                  # API service layer
├── App.jsx                     # Main application component
├── App.css                     # Responsive styles
└── main.jsx                    # Application entry point
```

## Responsive Breakpoints

- **Mobile**: < 768px - Single column layout
- **Tablet**: 768px - 1023px - Package list full width, 2 columns below
- **Desktop**: 1024px - 1279px - 3 column layout (balanced)
- **Large Desktop**: 1280px+ - 3 column layout (optimized ratios)
- **Extra Large**: 1920px+ - Max width container with optimal spacing

## API Integration

The app connects to the following backend endpoints:

- `GET /api/shipments` - List all shipments
- `GET /api/shipments/:id` - Get shipment by ID
- `GET /api/shipments/track/:trackingNumber` - Track by tracking number
- `GET /api/shipments/:id/location` - Get live driver location
- `GET /api/shipments/:id/events` - Get shipment status history

WebSocket events:
- `shipment_updated` - Real-time status updates
- `shipment_assigned` - Driver assignment notifications

## Design Layout

The UI follows the design specification in `design.md` with three main panels:

1. **Left Panel**: Package list with "Add Tracking / Package" button
2. **Center Panel**: Package information with current status and history timeline
3. **Right Panel**: Live driver location map (currently showing coordinates)

The "Add Tracking / Package" button remains in the left panel as specified.

## Running with Backend

Make sure the DropMate backend is running before starting the frontend:

1. Start the backend (from dropmate-backend folder):
```bash
cd ../dropmate-backend/services/core-api
npm start
```

2. Start the frontend (from dropmate-frontend folder):
```bash
npm run dev
```

The application will automatically connect to the backend API and WebSocket server.
