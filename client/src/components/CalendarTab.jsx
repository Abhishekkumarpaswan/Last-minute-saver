import { useState, useEffect } from "react";
import api from "../api/axios";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const BADGE = {
  critical: "bg-red-500/10 text-red-400 border border-red-500/20",
  high:     "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  medium:   "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  low:      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

function daysLeftStr(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((d - today) / 86400000);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `${diff} days left`;
}

export default function CalendarTab() {
  const [tasks, setTasks] = useState([]);
  const [offset, setOffset] = useState(0);

  useEffect(() => { api.get("/tasks").then(({ data }) => setTasks(data)); }, []);

  const today = new Date(); today.setHours(0,0,0,0);
  const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const label = base.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = base.getDay();
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const prevDays = new Date(base.getFullYear(), base.getMonth(), 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: prevDays - firstDay + i + 1, other: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, other: false });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDay - daysInMonth + 1, other: true });

  const getDateStr = (day) =>
    `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const upcoming = tasks.filter(t => !t.done).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#121824]/60 border border-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setOffset(o => o - 1)} className="text-gray-400 hover:text-white transition-colors duration-200 text-xl font-bold px-3 py-1 rounded-lg hover:bg-gray-800/40">‹</button>
          <span className="font-bold text-gray-200 tracking-wide text-sm uppercase">{label}</span>
          <button onClick={() => setOffset(o => o + 1)} className="text-gray-400 hover:text-white transition-colors duration-200 text-xl font-bold px-3 py-1 rounded-lg hover:bg-gray-800/40">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {DAYS.map(d => <div key={d} className="text-center text-xs text-gray-500 font-bold uppercase tracking-wider py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell, i) => {
            if (cell.other) return <div key={i} className="min-h-16 rounded-xl p-1.5 opacity-20"><span className="text-xs text-gray-600">{cell.day}</span></div>;
            const dateStr = getDateStr(cell.day);
            const isToday = offset === 0 && cell.day === today.getDate();
            const dayTasks = tasks.filter(t => t.date === dateStr && !t.done);
            return (
              <div key={i} className={`min-h-16 rounded-xl p-1.5 border transition-all duration-250 ${isToday ? "border-indigo-500/50 bg-indigo-500/5 shadow-md shadow-indigo-500/5" : "border-gray-800/50 bg-[#171f2e]/25 hover:border-gray-700/50"}`}>
                <span className={`text-xs font-bold ${isToday ? "text-indigo-400" : "text-gray-400"}`}>{cell.day}</span>
                {dayTasks.slice(0, 2).map(t => (
                  <div key={t._id} className={`text-[10px] rounded px-1.5 py-0.5 mt-1 truncate font-semibold uppercase tracking-wider ${BADGE[t.priority]}`}>
                    {t.name}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Upcoming deadlines</p>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-[#121824]/40 border border-gray-800/80 rounded-2xl">No upcoming deadlines. Add tasks in the Tasks tab.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map(t => (
              <div key={t._id} className="bg-[#121824]/60 border border-gray-800/80 backdrop-blur-md rounded-2xl px-5 py-4 flex items-center justify-between shadow-md transition-all duration-300 hover:border-gray-700/80">
                <span className="text-sm font-semibold text-gray-200">{t.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-400">📅 {daysLeftStr(t.date)}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${BADGE[t.priority]}`}>{t.priority}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
