import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Locate } from 'lucide-react';
import { Court, GeoLocation } from '../types';

// Fix for Leaflet default icon issues in webpack/react environments
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapContainerProps {
  courts: Court[];
  userLocation: GeoLocation | null;
  selectedCourtId: string | null;
  onSelectCourt: (id: string) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  courts, 
  userLocation, 
  selectedCourtId, 
  onSelectCourt 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Default to Singapore if no user location yet
      const initialLat = userLocation ? userLocation.lat : 1.3521;
      const initialLng = userLocation ? userLocation.lng : 103.8198;

      mapRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
      
      // Add animation styles for user marker
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes pulse-blue {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Update User Location Marker
  useEffect(() => {
    if (mapRef.current && userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          className: 'custom-user-icon',
          html: `<div style="
            background-color: #3b82f6; 
            width: 16px; 
            height: 16px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 0 0 rgba(59, 130, 246, 0.4);
            animation: pulse-blue 2s infinite;
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(mapRef.current)
          .bindPopup(`
             <div class="text-center">
               <b>Your Location</b>
               <br/>
               <a 
                 href="https://www.google.com/maps/search/?api=1&query=${userLocation.lat},${userLocation.lng}" 
                 target="_blank" 
                 class="text-blue-500 text-xs hover:underline"
               >
                 Open in Google Maps
               </a>
             </div>
          `);
          
        // Fly to user if it's the first precise lock
        mapRef.current.setView([userLocation.lat, userLocation.lng], 13);
      }
    }
  }, [userLocation]);

  // Update Court Markers
  useEffect(() => {
    if (!mapRef.current) return;

    courts.forEach(court => {
      if (!markersRef.current[court.id]) {
        // Create Google Maps URL
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${court.location.lat},${court.location.lng}`;

        const marker = L.marker([court.location.lat, court.location.lng])
          .addTo(mapRef.current!)
          .bindPopup(`
            <div class="font-sans min-w-[200px]">
              <h3 class="font-bold text-sm mb-1">${court.name}</h3>
              <p class="text-xs text-gray-600 mb-3">${court.address}</p>
              <div class="flex flex-col gap-2">
                <button 
                  class="bg-emerald-600 text-white text-xs px-3 py-2 rounded hover:bg-emerald-700 transition w-full font-medium" 
                  onclick="window.dispatchEvent(new CustomEvent('court-select', {detail: '${court.id}'}))"
                >
                  Select This Court
                </button>
                <a 
                  href="${googleMapsUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-800 text-xs text-center border border-blue-100 bg-blue-50 py-1.5 rounded w-full block"
                >
                  View in Google Maps
                </a>
              </div>
            </div>
          `);
        
        marker.on('click', () => {
          onSelectCourt(court.id);
        });

        markersRef.current[court.id] = marker;
      }
    });
  }, [courts, onSelectCourt]);

  // Handle global event for popup button click (workaround for Leaflet string HTML)
  useEffect(() => {
    const handleCourtSelect = (e: any) => {
      onSelectCourt(e.detail);
    };
    window.addEventListener('court-select', handleCourtSelect);
    return () => window.removeEventListener('court-select', handleCourtSelect);
  }, [onSelectCourt]);

  const handleLocateMe = () => {
    if (userLocation && mapRef.current) {
        mapRef.current.flyTo([userLocation.lat, userLocation.lng], 14);
    }
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      {userLocation && (
        <button 
          onClick={handleLocateMe}
          className="absolute bottom-5 right-5 z-[400] bg-white p-2.5 rounded-full shadow-lg hover:bg-slate-50 text-slate-700 transition-all active:scale-95 border border-slate-200"
          title="Go to my location"
          type="button"
        >
          <Locate className="w-5 h-5 text-blue-600" />
        </button>
      )}
    </div>
  );
};

export default MapContainer;