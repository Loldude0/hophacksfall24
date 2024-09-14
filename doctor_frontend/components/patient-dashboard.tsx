'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Circle } from 'lucide-react'

// Sample timeline data
const timelineEvents = [
  {
    date: '2023-06-15',
    title: 'Initial Consultation',
    description: 'Patient reported persistent cough and mild fever. Recommended further tests.',
    doctorNotes: 'Suspect upper respiratory infection. Ordered blood tests and chest X-ray.',
    prescription: 'Prescribed cough syrup and paracetamol for symptom relief.'
  },
  {
    date: '2023-06-22',
    title: 'Follow-up Appointment',
    description: 'Reviewed test results. Chest X-ray shows no significant abnormalities.',
    doctorNotes: 'Blood test results indicate mild infection. Patient reports improvement in symptoms.',
    prescription: 'Prescribed antibiotics for 7 days. Recommended rest and increased fluid intake.'
  },
  {
    date: '2023-07-06',
    title: 'Final Check-up',
    description: 'Patient reports full recovery. No more cough or fever.',
    doctorNotes: 'All symptoms resolved. Patient appears to be in good health.',
    prescription: 'No further medication required. Advised on preventive measures.'
  },
]

export function PatientDashboardComponent() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Side Panel */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Age:</strong> 35</p>
            <p><strong>Sex:</strong> Male</p>
            <p><strong>Height:</strong> 180 cm</p>
            <p><strong>Weight:</strong> 75 kg</p>
            <p><strong>Blood Type:</strong> O+</p>
          </div>
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
                <Button size="icon">
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
                    <span>{event.title}</span>
                    <span className="text-sm font-normal text-gray-500">{event.date}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-2">{event.description}</p>
                  <p className="text-gray-600 mb-2"><strong>Doctor's Notes:</strong> {event.doctorNotes}</p>
                  <p className="text-gray-600"><strong>Prescription:</strong> {event.prescription}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}