# Griddy City Backend

This is the backend service for the Griddy City application, providing APIs for managing transit data and user information.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Stops Table
```sql
CREATE TABLE stops (
  id SERIAL PRIMARY KEY,
  stop_id VARCHAR(255) UNIQUE NOT NULL,
  stop_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_type VARCHAR(255),
  parent_station VARCHAR(255),
  transfers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Trips Table
```sql
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  trip_id VARCHAR(255) UNIQUE NOT NULL,
  route_id VARCHAR(255) NOT NULL,
  service_id VARCHAR(255) NOT NULL,
  trip_headsign VARCHAR(255),
  direction_id VARCHAR(255),
  shape_id VARCHAR(255),
  stops JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Transit Stops

#### Get All Stops
- **GET** `/transit/stops`
- Returns a list of all transit stops
- Response: Array of stop objects

#### Get Stop by ID
- **GET** `/transit/stops/:stop_id`
- Returns a specific stop by its ID
- Response: Stop object or 404 if not found

#### Create Stop
- **POST** `/transit/stops`
- Creates a new transit stop
- Request Body:
  ```json
  {
    "stop_id": "string",
    "stop_name": "string",
    "latitude": number,
    "longitude": number,
    "location_type": "string" (optional),
    "parent_station": "string" (optional),
    "transfers": [
      {
        "line_id": "string",
        "stop_id": "string",
        "stop_name": "string",
        "transfer_type": "string"
      }
    ] (optional)
  }
  ```
- Response: Created stop object (201) or 409 if stop_id already exists

#### Update Stop
- **PUT** `/transit/stops/:stop_id`
- Updates an existing stop
- Request Body: Same as Create Stop (all fields optional)
- Response: Updated stop object or 404 if not found

#### Delete Stop
- **DELETE** `/transit/stops/:stop_id`
- Deletes a stop
- Response: Success message or 404 if not found

### Transit Trips

#### Get All Trips
- **GET** `/transit/trips`
- Returns a list of all transit trips
- Response: Array of trip objects

#### Get Trip by ID
- **GET** `/transit/trips/:trip_id`
- Returns a specific trip by its ID
- Response: Trip object or 404 if not found

#### Create Trip
- **POST** `/transit/trips`
- Creates a new transit trip
- Request Body:
  ```json
  {
    "trip_id": "string",
    "route_id": "string",
    "service_id": "string",
    "trip_headsign": "string" (optional),
    "direction_id": "string" (optional),
    "shape_id": "string" (optional),
    "stops": [
      {
        "stop_id": "string",
        "arrival_time": "string",
        "departure_time": "string",
        "stop_sequence": number
      }
    ] (optional)
  }
  ```
- Response: Created trip object (201) or 409 if trip_id already exists

#### Update Trip
- **PUT** `/transit/trips/:trip_id`
- Updates an existing trip
- Request Body: Same as Create Trip (all fields optional)
- Response: Updated trip object or 404 if not found

#### Delete Trip
- **DELETE** `/transit/trips/:trip_id`
- Deletes a trip
- Response: Success message or 404 if not found

## Data Types

### Stop Object
```typescript
{
  id: number;
  stop_id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
  location_type?: string;
  parent_station?: string;
  transfers: Array<{
    line_id: string;
    stop_id: string;
    stop_name: string;
    transfer_type: string;
  }>;
  created_at: string;
  updated_at: string;
}
```

### Trip Object
```typescript
{
  id: number;
  trip_id: string;
  route_id: string;
  service_id: string;
  trip_headsign?: string;
  direction_id?: string;
  shape_id?: string;
  stops: Array<{
    stop_id: string;
    arrival_time: string;
    departure_time: string;
    stop_sequence: number;
  }>;
  created_at: string;
  updated_at: string;
}
```

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid request body or parameters
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **500 Internal Server Error**: Server error

## Development

### Prerequisites
- Node.js
- PostgreSQL
- Docker (optional)

### Environment Variables
Create a `.env` file in the root directory with the following variables:
