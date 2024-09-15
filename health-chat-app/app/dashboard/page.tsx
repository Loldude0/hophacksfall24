'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Clipboard, MessageCircle, User } from 'lucide-react'

export default function Component() {
  const [isOpen, setIsOpen] = useState(false)
  const [prescriptions, setPrescriptions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const user_id = localStorage.getItem('user_id')
        if (!user_id) {
          setError('User ID not found')
          return
        }

        const response = await fetch(`http://localhost:5000/get_user_prescription?user_id=${user_id}`)
        const data = await response.json()

        if (data.status === 'ok') {
          setPrescriptions(data.prescriptions)
        } else {
          setError(data.message)
        }
      } catch (error) {
        setError('An error occurred while fetching prescriptions')
      }
    }

    fetchPrescriptions()
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Prescription Dashboard</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-4">
              <Link href="/dashboard" passHref>
                <Button className="w-full justify-start" variant="ghost" onClick={() => setIsOpen(false)}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Prescription Dashboard
                </Button>
              </Link>
              <Link href="/health-chat" passHref>
                <Button className="w-full justify-start" variant="ghost" onClick={() => setIsOpen(false)}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat
                </Button>
              </Link>
              <Link href="/user-info" passHref>
                <Button className="w-full justify-start" variant="ghost" onClick={() => setIsOpen(false)}>
                  <User className="mr-2 h-4 w-4" />
                  User Info
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </header>
      <main className="flex-grow p-4 overflow-auto">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((prescription, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{prescription.med_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Dosage:</strong> {prescription.med_dosage}</p>
                <p><strong>Frequency:</strong> {prescription.med_frequency}</p>
                <p><strong>Doctor's Note:</strong> {prescription.doctor_note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}