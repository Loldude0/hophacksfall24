'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserInfoPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState({
    name: '',
    sex: '',
    age: '',
    height: '',
    weight: ''
  })
  const [userId, setUserId] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
  }

  const handleSexChange = (value: string) => {
    setUserInfo({ ...userInfo, sex: value })
  }

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/search_patient?name=${userInfo.name}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      if (data.status === 'success' && data.patients.length > 0) {
        setUserId(data.patients[0]._id)
        setError(null)
      } else {
        setError('No patients found')
      }
    } catch (error) {
      console.error('Error searching for patient:', error)
      setError('Error searching for patient')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      setError('Please search for a patient first')
      return
    }
    // Store user info in localStorage
    localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, userId }))
    // Navigate to chat page
    router.push('/health-chat')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Health Chat</CardTitle>
          <CardDescription>Please provide your information to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="flex space-x-2">
                <Input id="name" name="name" value={userInfo.name} onChange={handleChange} required />
                <Button type="button" onClick={handleSearch}>Search</Button>
              </div>
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select onValueChange={handleSexChange} required>
                <SelectTrigger id="sex">
                  <SelectValue placeholder="Select your sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" value={userInfo.age} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" name="height" type="number" value={userInfo.height} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" name="weight" type="number" value={userInfo.weight} onChange={handleChange} required />
            </div>
            <Button type="submit" className="w-full">Start Chat</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}