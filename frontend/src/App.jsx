import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Submissions from './pages/Submissions'
import SubmissionDetail from './pages/SubmissionDetail'
import Upload from './pages/Upload'
import Analytics from './pages/Analytics'
import LeetCode from './pages/LeetCode'
import NotFound from './pages/NotFound'
import './styles/App.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/submissions" element={<Submissions />} />
                <Route path="/submissions/:id" element={<SubmissionDetail />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/leetcode" element={<LeetCode />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

