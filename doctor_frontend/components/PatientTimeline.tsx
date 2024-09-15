'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Circle } from 'lucide-react'
import { PieChart } from '@mui/x-charts';

export default function PatientTimeline({ selectedPatientId }) {
  const [timelineEvents, setTimelineEvents] = useState([])
  const [showAddActivityForm, setShowAddActivityForm] = useState(false)
  const [activityType, setActivityType] = useState('doctor_notes')
  const [doctorNote, setDoctorNote] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [medName, setMedName] = useState('')
  const [medDosage, setMedDosage] = useState('')
  const [medFrequency, setMedFrequency] = useState('')
  const [predictionData, setPredictionData] = useState({})

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

  useEffect(() => {
    const fetchPredictions = async () => {
      const newPredictionData = {}
      for (const event of timelineEvents) {
        if (event.activity_type === 'user_session' && !predictionData[event.id]) {
          try {
            console.log(event)
            const data = event.prediction
            newPredictionData[event.id] = data
          } catch (error) {
            console.error('Error fetching prediction:', error)
          }
        }
      }
      setPredictionData(prev => ({ ...prev, ...newPredictionData }))
    }

    fetchPredictions()
  }, [timelineEvents])

  const handleAddActivity = () => {
    setShowAddActivityForm(true)
  }

  const handleSubmitActivity = () => {
    const activityData = {
      user_id: selectedPatientId,
      activity_type: activityType,
      doctor_note: doctorNote,
      diagnosis: activityType === 'doctor_diagnosis' ? diagnosis : '',
      med_name: activityType === 'doctor_prescription' ? medName : '',
      med_dosage: activityType === 'doctor_prescription' ? medDosage : '',
      med_frequency: activityType === 'doctor_prescription' ? medFrequency : '',
    };

    fetch('http://localhost:5000/post_activity_info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === "success") {
          // Refresh the timeline events
          fetch(`http://localhost:5000/get_activity_info?user_id=${selectedPatientId}`)
            .then(response => response.json())
            .then(data => {
              if (data.status === "error") {
                console.error(data.message);
              } else {
                setTimelineEvents(data.activities);
              }
            })
            .catch(error => {
              console.error('Error fetching activity info:', error);
            });
        } else {
          console.error(data.message);
        }
      })
      .catch(error => {
        console.error('Error posting activity info:', error);
      });

    setShowAddActivityForm(false);
    setDoctorNote('');
    setDiagnosis('');
    setMedName('');
    setMedDosage('');
    setMedFrequency('');
  };

  const renderActivityContent = (event) => {
    switch (event.activity_type) {
      case 'user_session':
        return (
          <>
            <p><strong>Patient's Report: </strong> {
              Object.entries(event.state)
                .filter(([key, value]) => value !== false && value !== null)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')
            }</p>
            
            {event.images && (
              <div className="flex flex-wrap gap-2 mt-2">
                {event.images.map((image, index) => (
                  <img 
                    key={index} 
                    src={`data:image/png;base64,${image}`}
                    alt={`User session image ${index + 1}`}
                    className="max-w-xs h-auto"
                  />
                ))}
              </div>
            )}
            <p><strong>Summary:</strong> {event.summary}</p>
            <p><strong>Disease prediction:</strong> }</p>
            {event.prediction && (
              console.log(event.prediction),
              <div className="">
                <PieChart
                  series={[event.prediction]}
                  width={600}
                  height={250}
                />
              </div>
            )}
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
          <>
            <p><strong>Doctor's Prescription:</strong> {event.doctor_note}</p>
            <p><strong>Medication Name:</strong> {event.med_name}</p>
            <p><strong>Dosage:</strong> {event.med_dosage}</p>
            <p><strong>Frequency:</strong> {event.med_frequency}</p>
          </>
        );
      case 'more_info_request':
        return (
          <>
            <p><strong>Information requested:</strong> {event.doctor_note}</p>
            <p><strong>Status:</strong> {event.status}</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-4">Patient Timeline</h2>
      {selectedPatientId && (<Button onClick={handleAddActivity} className="mb-4">Add Activity</Button>)}
      
      {showAddActivityForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"> /* TODO: fix this later*/
            <div className="bg-white w-1/2 h-2/7 p-8 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-black mb-4">Add Activity</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black">Activity Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="mt-1 block text-black w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="doctor_notes">Doctor Notes</option>
                  <option value="doctor_diagnosis">Doctor Diagnosis</option>
                  <option value="doctor_prescription">Doctor Prescription</option>
                  <option value="more_info_request">More Info Request</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black">Doctor's Note</label>
                <textarea
                  value={doctorNote}
                  onChange={(e) => setDoctorNote(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              {activityType === 'doctor_diagnosis' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">Diagnosis</label>
                  <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}
              {activityType === 'doctor_prescription' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black">Medication Name</label>
                    <input
                      type="text"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black">Dosage</label>
                    <input
                      type="text"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black">Frequency</label>
                    <input
                      type="text"
                      value={medFrequency}
                      onChange={(e) => setMedFrequency(e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-4 text-black">
                <Button variant="outline" onClick={() => setShowAddActivityForm(false)}>Cancel</Button>
                <Button onClick={handleSubmitActivity}>Submit</Button>
              </div>
            </div>
          </div>
        )}

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
                    <span>{event.activity_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                    <span className="text-sm font-normal text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
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
  )
}