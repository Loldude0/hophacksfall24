'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from 'lucide-react'
import PatientTimeline from './PatientTimeline'

export default function PatientInformation() {
  const [searchQuery, setSearchQuery] = useState('')
  const [patientInfo, setPatientInfo] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState(null)

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
    setSelectedPatientId(user_id)
    setSearchResults([])
  }

  return (
    <div>
      <Card className="mb-8 w-full">
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">Search Results</h2>
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

      <div className="flex">
        <div className="w-1/5 pr-4">
          <h2 className="text-2xl font-semibold text-black mb-4">Patient Information</h2>
          {patientInfo ? (
            <div className="text-black space-y-2">
              <p><strong>Name:</strong> {patientInfo.name}</p>
              <p><strong>Age:</strong> {patientInfo.age}</p>
              <p><strong>Sex:</strong> {patientInfo.sex}</p>
              <p><strong>Height:</strong> {patientInfo.height} cm</p>
              <p><strong>Weight:</strong> {patientInfo.weight} kg</p>
              <p><strong>Blood Type:</strong> {patientInfo.blood_type}</p>
            </div>
          ) : (
            <p></p>
          )}
        </div>
        <div className="w-4/5">
          <PatientTimeline selectedPatientId={selectedPatientId} />
        </div>
      </div>
    </div>
  )
}