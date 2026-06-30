import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import TasksTab from "../components/TasksTab";
import CalendarTab from "../components/CalendarTab";
import HabitsTab from "../components/HabitsTab";
import VoiceTab from "../components/VoiceTab";

const TABS = [
  { id: "tasks",    label: "Tasks",    icon: "✅" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "habits",   label: "Habits",   icon: "🔄" },
  { id: "voice",    label: "Voice",    icon: "🎙️" },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("tasks");

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 relative overflow-hidden">
      {/* Ambient background glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="backdrop-blur-md bg-[#0f1624]/75 border-b border-gray-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-xl">⚡</span>
          </div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-indigo-400">
            Last-Minute Life Saver
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/40 border border-gray-700/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-300">Hi, {user?.name}</span>
          </div>
          <button onClick={logout} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-200">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="flex gap-2 mb-8 bg-[#0f1624]/50 border border-gray-800/80 backdrop-blur-sm p-1.5 rounded-2xl">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-300
                ${tab === t.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/40"}`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {tab === "tasks"    && <TasksTab />}
        {tab === "calendar" && <CalendarTab />}
        {tab === "habits"   && <HabitsTab />}
        {tab === "voice"    && <VoiceTab />}
      </div>
    </div>
  );
}
