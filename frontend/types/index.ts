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
