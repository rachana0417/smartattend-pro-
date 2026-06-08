import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const attendanceData = [
  { day: 'Mon', present: 28, absent: 4, late: 3 },
  { day: 'Tue', present: 30, absent: 2, late: 3 },
  { day: 'Wed', present: 25, absent: 5, late: 5 },
  { day: 'Thu', present: 29, absent: 3, late: 3 },
  { day: 'Fri', present: 27, absent: 4, late: 4 },
]

const latePatterns = [
  { name: 'Amit Kumar',   roll: 'CS103', pattern: 'Late every Monday', count: 4, risk: 'high' },
  { name: 'Riya Joshi',   roll: 'CS108', pattern: 'Late 3 days this week', count: 3, risk: 'high' },
  { name: 'Karan Mehta',  roll: 'CS112', pattern: 'Late twice this week', count: 2, risk: 'medium' },
  { name: 'Pooja Nair',   roll: 'CS115', pattern: 'Absent 2 consecutive days', count: 2, risk: 'medium' },
]

const allStudents = [
  { name: 'Rahul Sharma', roll: 'CS101', attendance: '92%', emotion: '😊', status: 'good' },
  { name: 'Priya Patel',  roll: 'CS102', attendance: '88%', emotion: '😐', status: 'good' },
  { name: 'Amit Kumar',   roll: 'CS103', attendance: '71%', emotion: '😴', status: 'risk' },
  { name: 'Sneha Reddy',  roll: 'CS104', attendance: '95%', emotion: '😊', status: 'good' },
  { name: 'Vikram Singh', roll: 'CS105', attendance: '60%', emotion: '—',  status: 'risk' },
  { name: 'Divya Menon',  roll: 'CS106', attendance: '83%', emotion: '😕', status: 'medium' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-purple-400">SmartAttend Pro</h1>
          <p className="text-gray-400 text-sm">Admin Dashboard</p>
        </div>
        <div className="text-right">
          <p className="text-gray-300 text-sm">Springfield High School</p>
          <p className="text-gray-500 text-xs">{new Date().toDateString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-4">
        {['overview', 'patterns', 'students', 'reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tab === 'overview' ? '📊 Overview' : tab === 'patterns' ? '⚠️ Late Patterns' : tab === 'students' ? '👥 Students' : '📄 Reports'}
          </button>
        ))}
      </div>

      <div className="p-6">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: '35',  color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
                { label: 'Present Today',  value: '28',  color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30'  },
                { label: 'Absent Today',   value: '4',   color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30'      },
                { label: 'Avg Attendance', value: '82%', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30'    },
              ].map(card => (
                <div key={card.label} className={`rounded-xl border p-4 text-center ${card.bg}`}>
                  <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-semibold mb-4">Weekly Attendance Overview</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={attendanceData}>
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                  <Bar dataKey="present" fill="#22c55e" radius={[4,4,0,0]} />
                  <Bar dataKey="late"    fill="#eab308" radius={[4,4,0,0]} />
                  <Bar dataKey="absent"  fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center text-sm">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm inline-block"></span> Present</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded-sm inline-block"></span> Late</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-sm inline-block"></span> Absent</span>
              </div>
            </div>
          </div>
        )}

        {/* LATE PATTERNS TAB */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-300 text-sm">⚠️ AI detected {latePatterns.length} students with concerning attendance patterns this week.</p>
            </div>
            {latePatterns.map((s, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 font-bold">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{s.name} <span className="text-gray-500 text-sm">({s.roll})</span></p>
                    <p className="text-sm text-gray-400">{s.pattern}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    s.risk === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {s.risk} risk
                  </span>
                  <button className="text-xs bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg transition">
                    Notify Parent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold">All Students</h2>
              <span className="text-sm text-gray-400">{allStudents.length} students</span>
            </div>
            <div className="divide-y divide-gray-800">
              {allStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
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
                    <span className="text-lg">{s.emotion}</span>
                    <span className="text-sm text-gray-300">{s.attendance}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      s.status === 'good' ? 'bg-green-500/20 text-green-400' :
                      s.status === 'risk' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-4 max-w-lg">
            {[
              { title: 'Weekly Attendance Report',  desc: 'Full class attendance for this week',     icon: '📊' },
              { title: 'Late Students Report',       desc: 'Students with late patterns this month', icon: '⏰' },
              { title: 'Absent Students Report',     desc: 'Students absent more than 3 days',       icon: '❌' },
              { title: 'Engagement Report',          desc: 'Class engagement scores this week',      icon: '🧠' },
            ].map((r, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-sm text-gray-400">{r.desc}</p>
                  </div>
                </div>
                <button className="text-xs bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition">
                  Download CSV
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}