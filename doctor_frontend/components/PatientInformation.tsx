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
  const [selectedPatientId, setSelectedPatientId] = useState('1')

  useEffect(() => {
    // Fetch patient info logic here
  }, [selectedPatientId])

  const handleSearch = () => {
    // Search logic here
  }

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
            />
            <Button size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Search Results</h2>
          <div className="space-y-4">
            {/* Search results rendering logic here */}
          </div>
        </div>
      )}

      <div className="flex">
        <div className="w-1/3 pr-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
          {patientInfo ? (
            <div className="space-y-2">
              {/* Patient info rendering logic here */}
            </div>
          ) : (
            <p>Loading patient information...</p>
          )}
        </div>
        <div className="w-2/3">
          <PatientTimeline selectedPatientId={selectedPatientId} />
        </div>
      </div>
    </div>
  )
}