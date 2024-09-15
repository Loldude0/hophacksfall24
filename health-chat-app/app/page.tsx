import { redirect } from 'next/navigation'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HealthChatInterface from '@/components/health-chat-interface';
import UserInfoPage from './user-info/page';

export default function Home() {
  redirect('/login')
};

