'use client'

import { ComposableMap, Geographies, Geography } from "react-simple-maps"

export default function DiseaseMap() {
    const geoUrl ="https://raw.githubusercontent.com/deldersveld/topojson/master/world-continents.json";
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Map of Diseases</h2>
            <ComposableMap>
            <Geographies geography={geoUrl}>
                {({ geographies }) =>
                geographies.map(geo => (
                    <Geography key={geo.rsmKey} geography={geo} />
                ))
                }
            </Geographies>
            </ComposableMap>
        </div>
    )
}