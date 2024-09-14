'use client'

import { useState } from 'react'
import { redirect, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {Routes, Route, BrowserRouter} from 'react-router-dom'

export default function UserInfoPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState({
    name: '',
    sex: '',
    age: '',
    height: '',
    weight: ''
  })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
  }

  const handleSexChange = (value: string) => {
    setUserInfo({ ...userInfo, sex: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store user info in localStorage
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
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
              <Input id="name" name="name" value={userInfo.name} onChange={handleChange} required />
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