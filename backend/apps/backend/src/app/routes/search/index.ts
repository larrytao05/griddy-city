import { FastifyInstance } from 'fastify';
import axios from 'axios';
import { randomUUID } from 'crypto';

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

export default async function (fastify: FastifyInstance) {
    //Autocomplete using SearchBox API
    fastify.get('/autocomplete', async (request, reply) => {
        const { q, session_token, lat, lng } = request.query as { 
            q?: string 
            session_token?: string
            lat?: string
            lng?: string
        };
        if (!q) return reply.status(400).send({ error: 'Missing query parameter' });
        if (!MAPBOX_TOKEN) return reply.status(500).send({ error: 'Mapbox token not configured' });

        // Generate a session token if not provided
        const sessionToken = session_token || randomUUID();

        const params = new URLSearchParams({
            access_token: MAPBOX_TOKEN,
            q,
            session_token: sessionToken,
            limit: '10', // Amount of autocomplete suggestions returned
            types: 'poi,place,neighborhood,address'
        });

        // Add proximity if user coordinates are provided
        if (lat && lng) {
            params.append('proximity', `${lng},${lat}`); // Mapbox expects "longitude,latitude"
        } else {
            // Fallback to NYC coordinates if no user location
            params.append('proximity', '-74.006,40.7128');
        }

        const url = `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`;
        try {
            const { data } = await axios.get(url);
            return data;
        } catch (error) {
            return reply.status(502).send({ error: 'Failed to fetch from Mapbox SearchBox API' });
        }
    });

    //Geocode using Geocoding API
    fastify.get('/geocode', async (request, reply) => {
        const { address } = request.query as { address?: string };
        if (!address) return reply.status(400).send({ error: 'Missing address parameter' });
        if (!MAPBOX_TOKEN) return reply.status(500).send({ error: 'Mapbox token not configured' });


        const params = new URLSearchParams({
            access_token: MAPBOX_TOKEN,
            q: address,
            autocomplete: 'true',
            limit: '1'
        });

        const url = `https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`;
        try {
            const { data } = await axios.get(url);
            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                return {
                    address: feature.place_name || feature.properties?.full_address || feature.properties?.name,
                    coordinates: feature.geometry?.coordinates || feature.center
                };
            } else {
                return reply.status(404).send({ error: 'No results found' });
            }
        } catch (error) {
            return reply.status(502).send({ error: 'Failed to fetch from Mapbox Geocoding API v6' });
        }
    });
}