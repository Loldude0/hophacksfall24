'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Circle } from 'lucide-react'

export function PatientDashboardComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [patientInfo, setPatientInfo] = useState(null)
  const [timelineEvents, setTimelineEvents] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('1') // Default user ID

  useEffect(() => {
    console.log('Fetching patient basic information...');
    fetch(`http://localhost:5000/get_basic_info?user_id=${selectedPatientId}`)
      .then(response => {
        console.log('Basic info response received:', response);
        return response.json();
      })
      .then(data => {
        console.log('Basic info data:', data);
        if (data.status === "error") {
          console.error(data.message);
        } else {
          setPatientInfo(data);
        }
      })
      .catch(error => {
        console.error('Error fetching patient info:', error);
      });

    console.log('Fetching patient activity information...');
    fetch(`http://localhost:5000/get_activity_info?user_id=${selectedPatientId}`)
      .then(response => {
        console.log('Activity info response received:', response);
        return response.json();
      })
      .then(data => {
        console.log('Activity info data:', data);
        if (data.status === "error") {
          console.error(data.message);
        } else {
          setTimelineEvents(data.activities);
        }
      })
      .catch(error => {
        console.error('Error fetching activity info:', error);
      });
  }, [selectedPatientId]);

  const handleSearch = () => {
    console.log('Initiating search for patients...');
    fetch(`http://localhost:5000/search_patient?name=${searchQuery}`)
      .then(response => {
        console.log('Search response received:', response);
        return response.json();
      })
      .then(data => {
        console.log('Search data:', data);
        if (data.status === "error") {
          console.error(data.message);
          setSearchResults([]);
        } else {
          setSearchResults(data.patients);
        }
      })
      .catch(error => {
        console.error('Error searching for patients:', error);
      });
  };

  const handlePatientSelect = (user_id) => {
    console.log('Selecting patient with ID:', user_id);
    setSelectedPatientId(user_id);
    setSearchResults([]); // Clear search results after selection
  };

  const renderActivityContent = (event) => {
    switch (event.activity_type) {
      case 'user_session':
        return (
          <>
            <p><strong>State:</strong> {event.state}</p>
            <p><strong>AI Notes:</strong> {event.ai_notes}</p>
            {event.images && event.images.map((image, index) => (
              <img key={index} src={`data:image/png;base64,${image}`} alt="User session" />
            ))}
          </>
        );
      case 'doctor_notes':
        return (
          <p><strong>Doctor's Notes:</strong> {event.doctor_note}</p>
        );
      case 'doctor_diagnosis':
        return (
          <p><strong>Diagnosis:</strong> {event.diagnosis}</p>
        );
      case 'doctor_prescription':
        return (
          <p><strong>Doctor's Notes:</strong> {event.doctor_note}</p>
        );
      case 'more_info_request':
        return (
          <>
            <p><strong>Doctor's Notes:</strong> {event.doctor_note}</p>
            <p><strong>Status:</strong> {event.status}</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Side Panel */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
          {patientInfo ? (
            <div className="space-y-2">
              <p><strong>Name:</strong> {patientInfo.name}</p>
              <p><strong>Age:</strong> {patientInfo.age}</p>
              <p><strong>Sex:</strong> {patientInfo.sex}</p>
              <p><strong>Height:</strong> {patientInfo.height} cm</p>
              <p><strong>Weight:</strong> {patientInfo.weight} kg</p>
              <p><strong>Blood Type:</strong> {patientInfo.blood_type}</p>
            </div>
          ) : (
            <p>Loading patient information...</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8 flex space-x-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Search for Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="w-64">
            <CardHeader>
              <CardTitle>Map of Diseases</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <MapPin className="mr-2 h-4 w-4" /> View Map
              </Button>
            </CardContent>
          </Card>
        </div>

        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Search Results</h2>
            <div className="space-y-4">
              {searchResults.map((patient, index) => (
                <Card key={index} className="p-4 cursor-pointer" onClick={() => handlePatientSelect(patient._id)}>
                  <CardHeader>
                    <CardTitle>{patient.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Age:</strong> {patient.age}</p>
                    <p><strong>Sex:</strong> {patient.sex}</p>
                    <p><strong>Height:</strong> {patient.height} cm</p>
                    <p><strong>Weight:</strong> {patient.weight} kg</p>
                    <p><strong>Blood Type:</strong> {patient.blood_type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Patient Timeline</h2>

        <div className="space-y-8">
          {timelineEvents.map((event, index) => (
            <div key={index} className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                  <Circle className="h-3 w-3 text-white" />
                </div>
                {index < timelineEvents.length - 1 && <div className="w-px h-full bg-blue-300" />}
              </div>
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{event.activity_type}</span>
                    <span className="text-sm font-normal text-gray-500">{new Date(event.timestamp).toLocaleDateString()}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderActivityContent(event)}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}