import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Navigation & Structure
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AITutorPage from './pages/AITutorPage';
import DocumentsPage from './pages/DocumentsPage';
import SummarizerPage from './pages/SummarizerPage';
import QuizGeneratorPage from './pages/QuizGeneratorPage';
import EvaluationPage from './pages/EvaluationPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login' | 'register'
  const [activePage, setActivePage] = useState('dashboard');

  // If user is not authenticated, show landing/auth screens
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <LoginPage
          onSwitchToRegister={() => setAuthView('register')}
          onBackToLanding={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterPage
          onSwitchToLogin={() => setAuthView('login')}
          onBackToLanding={() => setAuthView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onGetStarted={() => setAuthView('register')}
        onLogin={() => setAuthView('login')}
      />
    );
  }

  // Authenticated Portal Application Layout (StudySync Pro)
  return (
    <div className="app-container">
      {/* Sidebar matching Screenshot 1 navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navbar with streaks and progression from Screenshot 2 */}
        <Navbar onSearch={(q) => {
          if (q) {
            setActivePage('tutor');
          }
        }} />

        {/* Dynamic Page Views */}
        <main className="content-body">
          {activePage === 'dashboard' && <DashboardPage setActivePage={setActivePage} />}
          {activePage === 'library' && <DocumentsPage setActivePage={setActivePage} />}
          {activePage === 'tutor' && <AITutorPage />}
          {activePage === 'quizzes' && <QuizGeneratorPage />}
          {activePage === 'summarizer' && <SummarizerPage />}
          {activePage === 'evaluation' && <EvaluationPage />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
