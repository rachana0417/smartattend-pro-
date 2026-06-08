import { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import toast from 'react-hot-toast'
import axios from 'axios'

const mockStudents = [
  { id: 1, name: 'Rahul Sharma', roll: 'CS101', status: 'present', emotion: '😊 Attentive', time: '09:01 AM' },
  { id: 2, name: 'Priya Patel', roll: 'CS102', status: 'present', emotion: '😐 Neutral', time: '09:01 AM' },
  { id: 3, name: 'Amit Kumar', roll: 'CS103', status: 'late', emotion: '😴 Distracted', time: '09:14 AM' },
  { id: 4, name: 'Sneha Reddy', roll: 'CS104', status: 'present', emotion: '😊 Attentive', time: '09:02 AM' },
  { id: 5, name: 'Vikram Singh', roll: 'CS105', status: 'absent', emotion: '—', time: '—' },
  { id: 6, name: 'Divya Menon', roll: 'CS106', status: 'present', emotion: '😕 Confused', time: '09:03 AM' },
]

export default function TeacherDashboard() {
  const webcamRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [attendanceList, setAttendanceList] = useState([])
  const [activeTab, setActiveTab] = useState('scan')
  const [regPhoto, setRegPhoto] = useState(null)

  const handleScan = async () => {
    if (!webcamRef.current) {
      toast.error('Camera not ready')
      return
    }
    setScanning(true)
    setScanComplete(false)
    setAttendanceList([])
    toast.loading('Scanning classroom...', { id: 'scan' })

    try {
      const screenshot = webcamRef.current.getScreenshot()
      if (!screenshot) {
        toast.error('Could not capture image', { id: 'scan' })
        setScanning(false)
        return
      }
      const base64Image = screenshot.split(',')[1]
      const response = await axios.post('http://localhost:8000/attendance/scan', {
        image_base64: base64Image,
        class_name: 'Computer Science'
      })
      const data = response.data
      if (data.proxy_detected) {
        toast.error('⚠️ Proxy attempt detected!', { duration: 5000 })
      }
      if (data.results && data.results.length > 0) {
        setAttendanceList(data.results.map((r, i) => ({
          id: i,
          name: r.name,
          roll: r.roll || '—',
          status: r.status === 'present' ? 'present' : r.status === 'unrecognized' ? 'absent' : r.status,
          emotion: '😊 Detected',
          time: new Date().toLocaleTimeString(),
          confidence: r.confidence,
        })))
        setScanComplete(true)
        toast.success(`Scan complete! ${data.recognized} students recognized ✅`, { id: 'scan' })
      } else {
        toast.error(data.message || 'No faces detected', { id: 'scan' })
        setScanComplete(false)
      }
    } catch (error) {
      toast.error('Using demo data', { id: 'scan' })
      setAttendanceList(mockStudents)
      setScanComplete(true)
    } finally {
      setScanning(false)
    }
  }

  const handleRegister = async () => {
    const name = document.getElementById('reg-name').value
    const roll = document.getElementById('reg-roll').value
    const phone = document.getElementById('reg-phone').value
    const email = document.getElementById('reg-email').value

    if (!name || !roll || !phone || !email) {
      toast.error('Please fill in all fields')
      return
    }
    if (!regPhoto) {
      toast.error('Please capture a face photo first')
      return
    }
    try {
      toast.loading('Registering student...', { id: 'reg' })
      const base64Data = regPhoto.split(',')[1]
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('name', name)
      formData.append('roll_number', roll)
      formData.append('parent_phone', phone)
      formData.append('parent_email', email)
      formData.append('face_image', blob, 'face.jpg')
      await axios.post('http://localhost:8000/students/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`${name} registered! ✅`, { id: 'reg' })
      setRegPhoto(null)
      document.getElementById('reg-name').value = ''
      document.getElementById('reg-roll').value = ''
      document.getElementById('reg-phone').value = ''
      document.getElementById('reg-email').value = ''
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed', { id: 'reg' })
    }
  }

  const statusColor = (status) => {
    if (status === 'present') return 'bg-green-500/20 text-green-400'
    if (status === 'late') return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-red-500/20 text-red-400'
  }

  const present = attendanceList.filter(s => s.status === 'present').length
  const late = attendanceList.filter(s => s.status === 'late').length
  const absent = attendanceList.filter(s => s.status === 'absent').length

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-purple-400">SmartAttend Pro</h1>
          <p className="text-gray-400 text-sm">Teacher Dashboard</p>
        </div>
        <div className="text-right">
          <p className="text-gray-300 text-sm">Computer Science — Room 204</p>
          <p className="text-gray-500 text-xs">{new Date().toDateString()}</p>
        </div>
      </div>

      <div className="flex gap-2 px-6 pt-4">
        {['scan', 'attendance', 'register'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              activeTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tab === 'scan' ? '📷 Scan Class' : tab === 'attendance' ? '📋 Attendance' : '➕ Register Student'}
          </button>
        ))}
      </div>

      <div className="p-6">

        {activeTab === 'scan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h2 className="font-semibold">Live Camera</h2>
                <p className="text-gray-400 text-sm">Position camera to face the classroom</p>
              </div>
              <div className="relative">
                <Webcam ref={webcamRef} className="w-full" mirrored={true} screenshotFormat="image/jpeg" />
                {scanning && (
                  <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-purple-300 font-medium">Scanning faces...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
                >
                  {scanning ? 'Scanning...' : '🔍 Scan Classroom Now'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {scanComplete && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">{present}</p>
                    <p className="text-green-300 text-sm">Present</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-400">{late}</p>
                    <p className="text-yellow-300 text-sm">Late</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-red-400">{absent}</p>
                    <p className="text-red-300 text-sm">Absent</p>
                  </div>
                </div>
              )}

              {attendanceList.some(s => s.proxy_warning) && (
                <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                    <p className="text-red-400 font-semibold">Proxy Attempt Detected!</p>
                    <p className="text-red-300 text-sm">Multiple faces detected in suspicious proximity. Attendance flagged for review.</p>
                    </div>
                    </div>
                )}

              {scanComplete ? (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 flex-1">
                  <div className="p-4 border-b border-gray-800">
                    <h2 className="font-semibold">Detected Students</h2>
                  </div>
                  <div className="divide-y divide-gray-800">
                    {attendanceList.map(s => (
                      <div key={s.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.roll} · {s.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {s.confidence ? `${s.confidence}% match` : s.emotion}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(s.status)}`}>
                            {s.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-5xl mb-3">📷</p>
                    <p>Click "Scan Classroom Now" to take attendance</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h2 className="font-semibold">Today's Attendance</h2>
            </div>
            {attendanceList.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-4xl mb-3">📋</p>
                <p>No scan done yet. Go to Scan Class tab first.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {attendanceList.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 font-bold">
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-sm text-gray-500">{s.roll}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">{s.emotion}</span>
                      <span className="text-sm text-gray-500">{s.time}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'register' && (
          <div className="max-w-lg">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-semibold mb-4">Register New Student</h2>
              <div className="space-y-4">
                <input id="reg-name" placeholder="Full Name" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
                <input id="reg-roll" placeholder="Roll Number" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
                <input id="reg-phone" placeholder="Parent Phone" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
                <input id="reg-email" placeholder="Parent Email" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
                <div className="rounded-xl overflow-hidden border border-gray-700">
                  <Webcam ref={webcamRef} mirrored={true} screenshotFormat="image/jpeg" className="w-full" />
                </div>
                {regPhoto && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                    <p className="text-green-400 text-sm">✅ Face captured! Ready to register.</p>
                    <img src={regPhoto} className="w-24 h-24 rounded-full mx-auto mt-2 object-cover border-2 border-green-500" />
                  </div>
                )}
                <button
                  onClick={() => {
                    const shot = webcamRef.current?.getScreenshot()
                    if (shot) { setRegPhoto(shot); toast.success('Face captured!') }
                    else toast.error('Camera not ready')
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition"
                >
                  📸 Capture Face
                </button>
                <button
                  onClick={handleRegister}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
                >
                  ➕ Register Student
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}