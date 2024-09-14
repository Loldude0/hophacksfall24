'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"

export default function DiseaseMap() {
    const [selectedMarker, setSelectedMarker] = useState(null);

    const geoUrl ="https://raw.githubusercontent.com/deldersveld/topojson/master/world-continents.json";
    const markers = [
        { name: "Delhi", coordinates: [77.2090, 28.6139] },
        { name: "Mumbai", coordinates: [72.8777, 19.0760] },
        { name: "Bangalore", coordinates: [77.5946, 12.9716] },
    ];

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
    };  

    return (
        <div className="">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Map of Diseases</h2>
            <ComposableMap
            projection="geoMercator"
            projectionConfig={{
                scale: 700,
                center: [78.9629, 20.5937]
            }}
            >
            <Geographies geography="/india.json">
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
            {selectedMarker && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold">{selectedMarker.name}</h3>
                    <p className="text-sm text-gray-600">Coordinates: {selectedMarker.coordinates.join(', ')}</p>
                </div>
            )}
        </div>
    )
}