import { FastifyInstance } from 'fastify';
import axios from 'axios';
import { randomUUID } from 'crypto';

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

export interface SearchResult {
    mapbox_id: string
    name: string
    address: string
}

export interface Location {
    mapbox_id: string;
    name: string;
    address: string;
    place: string;
    lat: number;
    lng: number;
    attribution: string;
}

export default async function (fastify: FastifyInstance) {
    fastify.get('/autocomplete', async (request, reply) => {
        const { q, session_token, lat, lng } = request.query as { 
            q?: string 
            session_token?: string
            lat?: string
            lng?: string
        };
        if (!q) return reply.status(400).send({ error: 'Missing query parameter' });
        if (!MAPBOX_TOKEN) return reply.status(500).send({ error: 'Mapbox token not configured' });

        const sessionToken = session_token || randomUUID();
        const NYC_BOUNDING_BOX = '-74.3,40.4,-73.6,41.0';

        const params = new URLSearchParams({
            q,
            access_token: MAPBOX_TOKEN,
            session_token: sessionToken,
            limit: '10', 
            country: 'US',
            types: 'poi,place,neighborhood,address',
            bbox: NYC_BOUNDING_BOX
        });

        if (lat && lng) {
            params.append('proximity', `${lng},${lat}`); // Mapbox expects "longitude,latitude"
        } else {
            // Fallback to NYC coordinates if no user location
            params.append('proximity', '-74.006,40.7128');
        }

        const url = `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`;
        try {
            const { data } = await axios.get(url);
            if (!data.suggestions || data.suggestions.length === 0) {
                return reply.status(404).send({ error: 'No suggestions found' });
            }

            const suggestions : SearchResult[] = [];

            data.suggestions.forEach((suggestion: any) => {
                const result : SearchResult = {
                    mapbox_id: suggestion.mapbox_id,
                    name: suggestion.name,
                    address: suggestion.address
                };

                suggestions.push(result);
            });

            return suggestions;
        } catch (error) {
            return reply.status(502).send({ error: 'Failed to fetch from Mapbox autocomplete endpoint' });
        }
    });

    fastify.get('/retrieve', async (request, reply) => {
        const { q, session_token } = request.query as {
            q?: string
            session_token?: string
        };

        if (!q) return reply.status(400).send({ error: 'Missing query parameter' });
        if (!MAPBOX_TOKEN) return reply.status(500).send({ error: 'Mapbox token not configured' });
        const sessionToken = session_token || randomUUID();

        const params = new URLSearchParams({
            access_token: MAPBOX_TOKEN,
            session_token: sessionToken,
        });

        const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${q}?${params.toString()}`;

        try {
            const { data } = await axios.get(url);

            if (!data.features || data.features.length === 0) {
                return reply.status(404).send({ error: 'No results found' });
            }

            const properties = data.features[0].properties;
            if (!properties) {
                return reply.status(404).send({ error: 'No properties found' });
            }

            const location : Location = {
                mapbox_id: properties.mapbox_id,
                name: properties.name,
                address: properties.address,
                place: properties.place_formatted,
                lat: properties.coordinates.latitude,
                lng: properties.coordinates.longitude,
                attribution: data.attribution
            }

            return location;
        } catch (error) {
            return reply.status(502).send({ error: 'Failed to fetch from Mapbox retrieve endpoint'});
        }
    });
}