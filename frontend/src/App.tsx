import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Register from './pages/Register'

/**
 * The main App component.
 *
 * This component renders a set of routes to the login, register, and dashboard pages.
 *
 * The dashboard page is protected by the ProtectedRoute component, which checks if the user is logged in before allowing access.
 */
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
