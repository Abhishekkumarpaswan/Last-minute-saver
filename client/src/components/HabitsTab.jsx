import { useState, useEffect } from "react";
import api from "../api/axios";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setHours(0,0,0,0);
    d.setDate(d.getDate() - 6 + i);
    return d.toISOString().split("T")[0];
  });
}

export default function HabitsTab() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const days = getLast7Days();

  useEffect(() => { api.get("/habits").then(({ data }) => { setHabits(data); setLoading(false); }); }, []);

  const addHabit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post("/habits", { name });
    setName("");
    const { data } = await api.get("/habits");
    setHabits(data);
  };

  const toggle = async (id) => {
    const { data } = await api.put(`/habits/${id}/log`);
    setHabits(h => h.map(x => x._id === id ? data : x));
  };

  const deleteHabit = async (id) => {
    await api.delete(`/habits/${id}`);
    setHabits(h => h.filter(x => x._id !== id));
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={addHabit} className="bg-[#121824]/60 border border-gray-800/80 backdrop-blur-md rounded-2xl p-5 flex gap-3 shadow-xl">
        <input
          className="flex-1 bg-[#1a2233]/70 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200"
          placeholder="New habit (e.g. Review notes for 15 min)"
          value={name} onChange={e => setName(e.target.value)} required
        />
        <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-all duration-200 shadow-md active:scale-95">
          Add habit
        </button>
      </form>

      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : habits.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-[#121824]/40 border border-gray-800/80 rounded-2xl">
          <div className="text-4xl mb-3">🔄</div>
          <p>No habits yet. Add one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {habits.map(h => {
            const streak = days.filter(d => h.logs?.includes(d)).length;
            const loggedToday = h.logs?.includes(today);
            return (
              <div key={h._id} className="bg-[#121824]/60 border border-gray-800/80 backdrop-blur-md rounded-2xl p-5 shadow-lg transition-all duration-300 hover:border-gray-700/80">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-sm text-gray-200">{h.name}</p>
                  <button onClick={() => deleteHabit(h._id)} className="text-gray-500 hover:text-red-400 transition-colors duration-200 text-2xl leading-none px-1">×</button>
                </div>
                <p className="text-xs font-semibold text-amber-400 mb-4 flex items-center gap-1">🔥 {streak}-day streak this week</p>
                <div className="flex gap-2">
                  {days.map((d, i) => {
                    const logged = h.logs?.includes(d);
                    const isToday = d === today;
                    return (
                      <button
                        key={d}
                        onClick={() => isToday ? toggle(h._id) : null}
                        title={d}
                        className={`w-9 h-9 rounded-xl text-xs font-bold border-2 transition-all duration-200 flex items-center justify-center
                          ${logged 
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                            : isToday 
                              ? "border-indigo-500 text-indigo-400 hover:bg-indigo-500/10" 
                              : "border-gray-800 text-gray-500 bg-gray-900/30"}`}
                      >
                        {logged ? "✓" : DAY_LABELS[i]}
                      </button>
                    );
                  })}
                </div>
                {loggedToday && (
                  <p className="text-xs font-semibold text-emerald-400 mt-3 flex items-center gap-1">✓ Done today!</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
