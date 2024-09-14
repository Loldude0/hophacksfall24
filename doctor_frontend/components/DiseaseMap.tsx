'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"

const Dialog = ({ marker, onClose }) => (
    <div className="absolute top-0 right-0 w-1/4 h-full bg-white shadow-lg p-4">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
            Close
        </button>
        <h3 className="text-lg font-semibold">{marker.name}</h3>
        <p className="text-sm text-gray-600">Coordinates: {marker.coordinates.join(', ')}</p>
    </div>
);

export default function DiseaseMap() {
    const geoUrl = "/india.json";
    const markers = [
        { name: "Test User 1", coordinates: [77.2090, 28.6139] },
        { name: "Test User 2", coordinates: [72.8777, 19.0760] },
        { name: "Test User 3", coordinates: [77.5946, 12.9716] },
    ];

    const [selectedMarker, setSelectedMarker] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [center, setCenter] = useState([78.9629, 20.5937]);

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
        setZoom(5); // Adjust the zoom level as needed
        setCenter(marker.coordinates);
    };

    const handleCloseDialog = () => {
        setSelectedMarker(null);
        setZoom(1); // Reset zoom to default
        setCenter([78.9629, 20.5937]); // Reset center to default
    };

    return (
        <div className="w-full h-full overflow-hidden relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 p-4">Map of Diseases</h2>
            <div className="w-full h-full">
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: 700 * zoom,
                        center: center
                    }}
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map(geo => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#606060"
                                />
                            ))
                        }
                    </Geographies>
                    {markers.map((marker, index) => (
                        <Marker key={index} coordinates={marker.coordinates} onClick={() => handleMarkerClick(marker)}>
                            <circle r={5} fill="#F53" stroke="#fff" strokeWidth={2} />
                        </Marker>
                    ))}
                </ComposableMap>
            </div>
            {selectedMarker && (
                <Dialog marker={selectedMarker} onClose={handleCloseDialog} />
            )}
        </div>
    )
}