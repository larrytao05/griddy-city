import React, { createContext, useContext, useState } from 'react';

interface Location {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface SearchContextType {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  return (
    <SearchContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}
