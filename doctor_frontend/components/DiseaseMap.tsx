import React, { useState, useEffect } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"

const Dialog = ({ patientData, onClose }) => (
    <div className="absolute top-0 right-0 w-1/4 h-full bg-white shadow-lg p-4 overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
            Close
        </button>
        {patientData ? (
            <>
                <h3 className="text-lg font-semibold mb-4">{patientData.name}</h3>
                <p><strong>Age:</strong> {patientData.age}</p>
                <p><strong>Sex:</strong> {patientData.sex}</p>
                <p><strong>Height:</strong> {patientData.height} cm</p>
                <p><strong>Weight:</strong> {patientData.weight} kg</p>
                <p><strong>Blood Type:</strong> {patientData.blood_type}</p>
            </>
        ) : (
            <p>Loading patient information...</p>
        )}
    </div>
);

export default function DiseaseMap() {
    const geoUrl = "/india.json";
    
    const [markers, setMarkers] = useState([]);
    const [selectedPatientData, setSelectedPatientData] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [center, setCenter] = useState([78.9629, 20.5937]);

    useEffect(() => {
        fetch('http://localhost:5000/get_patient_addresses')
            .then(response => response.json())
            .then(data => {
                if (data.status === "ok") {
                    setMarkers(data.addresses);
                } else {
                    console.error(data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching patient addresses:', error);
            });
    }, []);

    const handleMarkerClick = (marker) => {
        setSelectedPatientData(null); // Reset patient data while loading
        setZoom(5); // Adjust the zoom level as needed
        setCenter(marker.coordinates);

        // Fetch patient data
        fetch(`http://localhost:5000/get_basic_info?user_id=${marker.name}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === "error") {
                    console.error(data.message);
                } else {
                    setSelectedPatientData({
                        ...data // Spread the fetched data
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching patient info:', error);
            });
    };

    const handleCloseDialog = () => {
        setSelectedPatientData(null);
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
                            <circle r={2} fill="#F53" stroke="#fff" strokeWidth={0} />
                        </Marker>
                    ))}
                </ComposableMap>
            </div>
            {selectedPatientData && (
                <Dialog patientData={selectedPatientData} onClose={handleCloseDialog} />
            )}
        </div>
    )
}