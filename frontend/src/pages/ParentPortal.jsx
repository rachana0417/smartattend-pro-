import { useState } from 'react'

const childData = {
  name: 'Amit Kumar',
  roll: 'CS103',
  class: 'Computer Science — Room 204',
  photo: '👦',
  overallAttendance: '71%',
  totalDays: 35,
  present: 25,
  late: 5,
  absent: 5,
}

const recentRecords = [
  { date: 'Sat, Jun 06', status: 'present', time: '09:01 AM', emotion: '😊 Attentive' },
  { date: 'Fri, Jun 05', status: 'late',    time: '09:18 AM', emotion: '😴 Distracted' },
  { date: 'Thu, Jun 04', status: 'present', time: '08:58 AM', emotion: '😊 Attentive' },
  { date: 'Wed, Jun 03', status: 'absent',  time: '—',        emotion: '—' },
  { date: 'Tue, Jun 02', status: 'absent',  time: '—',        emotion: '—' },
  { date: 'Mon, Jun 01', status: 'late',    time: '09:22 AM', emotion: '😐 Neutral' },
]

const notifications = [
  { message: 'Amit was marked absent today',          time: '2 days ago', type: 'absent' },
  { message: 'Amit arrived late (9:18 AM) on Friday', time: '3 days ago', type: 'late'   },
  { message: 'Amit was absent on Wednesday',          time: '4 days ago', type: 'absent' },
  { message: 'Attendance below 75% — please check',  time: '5 days ago', type: 'warning' },
]

export default function ParentPortal() {
  const [activeTab, setActiveTab] = useState('overview')

  const statusColor = (status) => {
    if (status === 'present') return 'bg-green-500/20 text-green-400'
    if (status === 'late')    return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-red-500/20 text-red-400'
  }

  const notifColor = (type) => {
    if (type === 'absent')  return 'border-red-500/40 bg-red-500/5'
    if (type === 'late')    return 'border-yellow-500/40 bg-yellow-500/5'
    return 'border-orange-500/40 bg-orange-500/5'
  }

  const notifIcon = (type) => {
    if (type === 'absent')  return '❌'
    if (type === 'late')    return '⏰'
    return '⚠️'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-purple-400">SmartAttend Pro</h1>
          <p className="text-gray-400 text-sm">Parent Portal</p>
        </div>
        <div className="text-right">
          <p className="text-gray-300 text-sm">Welcome, Parent</p>
          <p className="text-gray-500 text-xs">{new Date().toDateString()}</p>
        </div>
      </div>

      {/* Child info card */}
      <div className="px-6 pt-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-purple-600/30 flex items-center justify-center text-4xl">
            {childData.photo}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{childData.name}</h2>
            <p className="text-gray-400 text-sm">{childData.roll} · {childData.class}</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${
              parseInt(childData.overallAttendance) >= 75 ? 'text-green-400' : 'text-red-400'
            }`}>
              {childData.overallAttendance}
            </p>
            <p className="text-gray-400 text-sm">Overall Attendance</p>
            {parseInt(childData.overallAttendance) < 75 && (
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                Below 75% ⚠️
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-4">
        {['overview', 'records', 'notifications'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tab === 'overview' ? '📊 Overview' : tab === 'records' ? '📋 Records' : `🔔 Alerts (${notifications.length})`}
          </button>
        ))}
      </div>

      <div className="p-6">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{childData.present}</p>
                <p className="text-green-300 text-sm">Days Present</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-yellow-400">{childData.late}</p>
                <p className="text-yellow-300 text-sm">Days Late</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-red-400">{childData.absent}</p>
                <p className="text-red-300 text-sm">Days Absent</p>
              </div>
            </div>

            {/* Attendance bar */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Attendance Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Present', value: childData.present, total: childData.totalDays, color: 'bg-green-500' },
                  { label: 'Late',    value: childData.late,    total: childData.totalDays, color: 'bg-yellow-500' },
                  { label: 'Absent',  value: childData.absent,  total: childData.totalDays, color: 'bg-red-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-gray-300">{item.value} / {item.total} days</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${(item.value / item.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-300 text-sm font-medium">⚠️ Attendance Warning</p>
              <p className="text-red-400 text-sm mt-1">
                {childData.name}'s attendance is below the required 75%. Please ensure regular attendance to avoid academic issues.
              </p>
            </div>
          </div>
        )}

        {/* RECORDS TAB */}
        {activeTab === 'records' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h2 className="font-semibold">Recent Attendance Records</h2>
            </div>
            <div className="divide-y divide-gray-800">
              {recentRecords.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-sm">{r.date}</p>
                    <p className="text-xs text-gray-500">{r.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{r.emotion}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={i} className={`border rounded-xl p-4 flex items-start gap-3 ${notifColor(n.type)}`}>
                <span className="text-xl">{notifIcon(n.type)}</span>
                <div>
                  <p className="text-sm font-medium">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}