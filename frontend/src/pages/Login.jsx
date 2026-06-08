import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('teacher')
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/auth/login', {
        email, password
      })
      const { token, role, name } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('name', name)
      toast.success(`Welcome back, ${name}! ✅`)
      if (role === 'teacher') navigate('/teacher')
      else if (role === 'admin') navigate('/admin')
      else navigate('/parent')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/auth/register', {
        name, email, password, role
      })
      const { token, role: userRole, name: userName } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('role', userRole)
      localStorage.setItem('name', userName)
      toast.success(`Account created! Welcome, ${userName} ✅`)
      if (userRole === 'teacher') navigate('/teacher')
      else if (userRole === 'admin') navigate('/admin')
      else navigate('/parent')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-1">SmartAttend Pro</h1>
        <p className="text-gray-400 mb-8">Classroom Intelligence System</p>

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">

          {isRegistering && (
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.com"
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Please wait...' : isRegistering ? 'Create Account' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-purple-400 text-sm hover:text-purple-300"
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>

        {!isRegistering && (
          <div className="mt-4 bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-2">Demo accounts:</p>
            <p className="text-gray-300 text-xs">teacher@school.com / teacher123</p>
            <p className="text-gray-300 text-xs">admin@school.com / admin123</p>
            <p className="text-gray-300 text-xs">parent@school.com / parent123</p>
          </div>
        )}
      </div>
    </div>
  )
}