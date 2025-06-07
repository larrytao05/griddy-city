-- Drop the existing unique constraint on vehicle_id
ALTER TABLE vehicle_positions DROP CONSTRAINT IF EXISTS vehicle_positions_vehicle_id_key;

-- Add a unique constraint on trip_id
ALTER TABLE vehicle_positions ADD CONSTRAINT vehicle_positions_trip_id_key UNIQUE (trip_id); 