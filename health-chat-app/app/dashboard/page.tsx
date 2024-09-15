'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Clipboard, MessageCircle, User } from 'lucide-react'

export default function Component() {
  const [isOpen, setIsOpen] = useState(false)

  // Mock data for prescriptions
  const prescriptions = [
    { id: 1, name: "Amoxicillin", dosage: "500mg", frequency: "3 times a day" },
    { id: 2, name: "Ibuprofen", dosage: "400mg", frequency: "As needed" },
    { id: 3, name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
  ]

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id}>
              <CardHeader>
                <CardTitle>{prescription.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Dosage:</strong> {prescription.dosage}</p>
                <p><strong>Frequency:</strong> {prescription.frequency}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}