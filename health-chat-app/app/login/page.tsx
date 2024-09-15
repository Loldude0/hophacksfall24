'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Custom function to generate a unique identifier similar to MongoDB ObjectId
function generateObjectId() {
  const timestamp = ((new Date().getTime() / 1000) | 0).toString(16)
  return (
    timestamp +
    'xxxxxxxxxxxxxxxx'
      .replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16))
      .toLowerCase()
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [loginInfo, setLoginInfo] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginInfo({ ...loginInfo, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // First, search for the patient by name
      const searchResponse = await fetch(`http://localhost:5000/search_patient?name=${loginInfo.username}`)
      const searchData = await searchResponse.json()

      if (searchData.status === 'error') {
        setError(searchData.message)
        return
      }

      if (searchData.patients.length === 0) {
        setError('No patients found with this name')
        return
      }

      // Assuming the first patient found is the correct one
      const patient = searchData.patients[0]
      const userId = patient._id

      // Then, get the basic info using the user_id
      const response = await fetch(`http://localhost:5000/get_basic_info?user_id=${userId}`)
      const data = await response.json()

      if (data.status === 'error') {
        setError('User not found')
      } else {
        localStorage.setItem('user_id', data._id)
        localStorage.setItem('username', data.name)
        router.push('/dashboard')
      }
    } catch (error) {
      setError('An error occurred while logging in')
    }
  }

  const handleSignUp = async () => {
    try {
      const response = await fetch('http://localhost:5000/post_basic_info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: generateObjectId(), // Generate a unique identifier
          name: loginInfo.username, // Assuming name is the same as username for simplicity
          password: loginInfo.password // You should hash this in a real application
        })
      })
      const data = await response.json()
      if (data.status === 'success') {
        localStorage.setItem('user_id', data.user_id)
        localStorage.setItem('username', loginInfo.username)
        router.push('/dashboard')
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('An error occurred while signing up')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to DocReach</CardTitle>
          <CardDescription>Enter your credentials to access DocReach</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username" 
                value={loginInfo.username} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={loginInfo.password} 
                onChange={handleChange} 
                required 
              />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={handleSignUp}>
              Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}