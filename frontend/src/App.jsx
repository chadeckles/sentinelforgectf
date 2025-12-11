import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ChallengesPage from './pages/ChallengesPage'
import ChallengeDetailPage from './pages/ChallengeDetailPage'
import ScoreboardPage from './pages/ScoreboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e0e0ff',
            border: '1px solid #00f0ff',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#00ff88',
              secondary: '#0a0a0f',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff0055',
              secondary: '#0a0a0f',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="challenges/:id" element={<ChallengeDetailPage />} />
          <Route path="scoreboard" element={<ScoreboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
