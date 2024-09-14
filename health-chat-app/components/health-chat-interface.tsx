'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Send, Image as ImageIcon, StopCircle } from 'lucide-react'

type Message = {
  id: number;
  type: 'text' | 'audio' | 'image';
  content: string;
  sender: 'user' | 'system';
}

export default function HealthChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      type: 'text',
      content: "Can I please know your symptoms?",
      sender: 'system'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [prevResponse, setPrevResponse] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    return () => {
      if (audioURL) URL.revokeObjectURL(audioURL)
    }
  }, [audioURL])

  const getBotResponse = async (content: string, type: string, file_name: string) => {
    try {
      const response = await fetch('http://localhost:5000/get_bot_response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: prevResponse, response_type: type, content: content , file_name: file_name }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // TODO: add handling to stauts = done

      const newMessage: Message = {
        id: Date.now(),
        type: 'text',
        content: data.message, // Assuming the response has a 'message' field
        sender: 'system',
      };
      setMessages(prev => [...prev, newMessage]);
      setPrevResponse(data.message);
    } catch (error) {
      console.error('Error fetching bot response:', error);
    }
  }

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        type: 'text',
        content: inputText,
        sender: 'user'
      }
      setMessages(prev => [...prev, newMessage])
      setInputText('')
      getBotResponse(inputText, "", '')
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Image = e.target?.result as string
        const newMessage: Message = {
          id: Date.now(),
          type: 'image',
          content: base64Image,
          sender: 'user'
        }
        setMessages(prev => [...prev, newMessage])
        getBotResponse(base64Image, "image", file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioURL(audioUrl)
        const newMessage: Message = {
          id: Date.now(),
          type: 'audio',
          content: audioUrl,
          sender: 'user'
        }
        setMessages(prev => [...prev, newMessage])
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Audio = reader.result as string
          getBotResponse(base64Audio, "audio", 'audio.wav')
        }
        reader.readAsDataURL(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background">
      <header className="bg-primary text-primary-foreground p-4 text-center">
        <h1 className="text-2xl font-bold">Health Chat</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card className={`max-w-[80%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
              <CardContent className="p-3">
                {message.type === 'text' && <p>{message.content}</p>}
                {message.type === 'image' && <img src={message.content} alt="Uploaded" className="max-w-full h-auto rounded" />}
                {message.type === 'audio' && <audio src={message.content} controls className="max-w-full" />}
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2 mb-2">
          <Button variant="outline" size="icon" onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" asChild>
            <label>
              <ImageIcon className="h-4 w-4" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
            </label>
          </Button>
        </div>
        <div className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your symptoms..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}