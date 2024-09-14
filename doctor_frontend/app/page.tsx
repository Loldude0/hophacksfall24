'use client'

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import PatientInformation from '../components/PatientInformation'
import DiseaseMap from '../components/DiseaseMap'

export default function Home() {
  const [selectedView, setSelectedView] = useState('patient-info')

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setSelectedView={setSelectedView} />
      <div className="flex-1 p-8 overflow-auto">
        {selectedView === 'patient-info' ? (
          <PatientInformation />
        ) : (
          <DiseaseMap />
        )}
      </div>
    </div>
  )
}