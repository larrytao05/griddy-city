# Backend API Documentation

## Database Schema

### Users Table
- `id`: SERIAL PRIMARY KEY
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `password_hash`: VARCHAR(255) NOT NULL
- `full_name`: VARCHAR(255)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

### Stops Table
- `id`: SERIAL PRIMARY KEY
- `stop_id`: VARCHAR(255) UNIQUE NOT NULL
- `stop_name`: VARCHAR(255) NOT NULL
- `latitude`: DECIMAL(10, 8) NOT NULL
- `longitude`: DECIMAL(11, 8) NOT NULL
- `location_type`: VARCHAR(255)
- `parent_station`: VARCHAR(255)
- `transfers`: JSONB DEFAULT '[]'::jsonb
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

### Trips Table
- `id`: SERIAL PRIMARY KEY
- `trip_id`: VARCHAR(255) UNIQUE NOT NULL
- `route_id`: VARCHAR(255) NOT NULL
- `service_id`: VARCHAR(255) NOT NULL
- `trip_headsign`: VARCHAR(255)
- `direction_id`: VARCHAR(255)
- `shape_id`: VARCHAR(255)
- `stops`: JSONB DEFAULT '[]'::jsonb
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

### Vehicle Positions Table
- `id`: SERIAL PRIMARY KEY
- `vehicle_id`: VARCHAR(255) NOT NULL
- `trip_id`: VARCHAR(255) NOT NULL UNIQUE
- `route_id`: VARCHAR(255) NOT NULL
- `latitude`: DECIMAL(10, 8) NOT NULL
- `longitude`: DECIMAL(11, 8) NOT NULL
- `bearing`: FLOAT
- `speed`: FLOAT
- `current_stop_id`: VARCHAR(255)
- `current_stop_status`: VARCHAR(50)
- `congestion_level`: VARCHAR(50)
- `occupancy_status`: VARCHAR(50)
- `timestamp`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

## Data Management

### Static Data
- The `users`, `stops`, and `trips` tables are created during server startup
- GTFS static data is imported during container initialization
- These tables persist across server restarts

### Real-time Data
- The `vehicle_positions` table is recreated on each server startup to ensure fresh data
- Vehicle positions are updated in real-time from the MTA GTFS-realtime feed
- Each vehicle position is uniquely identified by its `trip_id`
- The table includes additional fields for vehicle status and occupancy information

## API Routes

### Transit Routes

#### Stops
- `GET /transit/stops/` - Get all stops
- `GET /transit/stops/:stop_id` - Get stop by ID
- `POST /transit/stops/` - Create new stop

#### Trips
- `GET /transit/trips/` - Get all trips
- `GET /transit/trips/:trip_id` - Get trip by ID
- `POST /transit/trips/` - Create new trip

#### Vehicle Positions
- `GET /transit/vehicles/positions` - Get all vehicle positions
- `POST /transit/vehicles/positions` - Update vehicle positions from MTA GTFS-realtime feed

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL 16+
- Docker (optional)

### Setup
1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Start the development server:
```bash
npm run dev
```

### Docker
Build and run with Docker:
```bash
docker compose build
docker compose up
```

### Database Management
- Static tables (users, stops, trips) are automatically created on server startup
- GTFS static data is imported during container startup
- Vehicle positions table is recreated on each startup for fresh real-time data
- Vehicle positions are updated in real-time from the MTA GTFS-realtime feed

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid request body or parameters
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **500 Internal Server Error**: Server error