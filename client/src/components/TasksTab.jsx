import { useState, useEffect } from "react";
import api from "../api/axios";

const BADGE = {
  critical: "bg-red-500/10 text-red-400 border border-red-500/20",
  high:     "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  medium:   "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  low:      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  done:     "bg-gray-800/40 text-gray-400 border border-gray-700/50",
};

const BAR = {
  critical: "bg-gradient-to-r from-red-500 to-rose-500 shadow-lg shadow-red-500/20",
  high:     "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/15",
  medium:   "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/15",
  low:      "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/15",
};

function daysLeft(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((d - today) / 86400000);
  if (diff < 0) return { label: "Overdue", days: diff };
  if (diff === 0) return { label: "Due today", days: 0 };
  if (diff === 1) return { label: "Due tomorrow", days: 1 };
  return { label: `${diff} days left`, days: diff };
}

function effortStr(m) {
  return m < 60 ? `${m} min` : `${m / 60}h`;
}

export default function TasksTab() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ name: "", date: "", effort: "60" });
  const [loading, setLoading] = useState(true);
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [prioritizeAdvice, setPrioritizeAdvice] = useState("");
  const [prioritizeLoading, setPrioritizeLoading] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    await api.post("/tasks", { ...form, effort: parseInt(form.effort) });
    setForm({ name: "", date: "", effort: "60" });
    fetchTasks();
  };

  const toggleDone = async (task) => {
    await api.put(`/tasks/${task._id}`, { done: !task.done });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const getMicroPlan = async (task) => {
    setAiLoading(true);
    setAiPlan(null);
    const { days } = daysLeft(task.date);
    try {
      const { data } = await api.post("/ai/micro-plan", {
        task_name: task.name,
        days_left: Math.max(0, days),
        effort_minutes: task.effort,
      });
      setAiPlan({ taskName: task.name, steps: data.steps });
    } catch {
      setAiPlan({ taskName: task.name, steps: ["Could not reach AI service. Make sure ai-service is running."] });
    } finally {
      setAiLoading(false);
    }
  };

  const getPrioritize = async () => {
    setPrioritizeLoading(true);
    const pending = tasks.filter(t => !t.done).map(t => ({
      name: t.name,
      daysLeft: Math.max(0, daysLeft(t.date).days),
      effort: t.effort,
    }));
    try {
      const { data } = await api.post("/ai/prioritize", { tasks: pending });
      setPrioritizeAdvice(data.advice);
    } catch {
      setPrioritizeAdvice("Could not reach AI service.");
    } finally {
      setPrioritizeLoading(false);
    }
  };

  const pending = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);
  const critical = pending.filter(t => t.priority === "critical").length;

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={addTask} className="bg-[#121824]/60 border border-gray-800/80 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
        <p className="text-sm font-bold text-gray-200">Add a new task</p>
        <div className="flex gap-3 flex-wrap">
          <input
            className="flex-1 min-w-48 bg-[#1a2233]/70 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200"
            placeholder="Task name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
          />
          <input
            className="bg-[#1a2233]/70 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200"
            type="date" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required
          />
          <select
            className="bg-[#1a2233]/70 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200"
            value={form.effort} onChange={e => setForm(f => ({ ...f, effort: e.target.value }))}>
            <option value="30">30 min</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="240">Half day</option>
            <option value="480">Full day</option>
          </select>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-all duration-200 shadow-md shadow-indigo-500/10 active:scale-95">
            Add task
          </button>
        </div>
      </form>

      {tasks.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[["Total", tasks.length, "text-indigo-400 bg-indigo-500/5 border-indigo-500/10"], ["Critical", critical, "text-red-400 bg-red-500/5 border-red-500/10"], ["Done", done.length, "text-emerald-400 bg-emerald-500/5 border-emerald-500/10"]].map(([label, val, cls]) => (
            <div key={label} className={`border rounded-2xl p-5 text-center backdrop-blur-sm shadow-lg ${cls}`}>
              <div className="text-3xl font-extrabold">{val}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {pending.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={getPrioritize}
            disabled={prioritizeLoading}
            className="text-sm font-semibold border border-indigo-500/30 text-indigo-400 rounded-xl px-5 py-2.5 hover:bg-indigo-500/10 hover:border-indigo-500/60 transition-all duration-200 disabled:opacity-60"
          >
            {prioritizeLoading ? "Thinking..." : "✨ AI: help me prioritize today"}
          </button>
        </div>
      )}

      {prioritizeAdvice && (
        <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-5 text-sm text-gray-200">
          <p className="font-semibold text-indigo-400 mb-2">✨ AI prioritization advice</p>
          <p className="leading-relaxed">{prioritizeAdvice}</p>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-[#121824]/40 border border-gray-800/80 rounded-2xl">
          <div className="text-4xl mb-3">✅</div>
          <p>No tasks yet. Add one above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sorted by urgency</p>
          {[...pending].concat(done).map(task => {
            const level = task.done ? "done" : task.priority;
            const { label: dlLabel } = daysLeft(task.date);
            const score = task.urgencyScore || 0;
            return (
              <div key={task._id} className="bg-[#121824]/60 border border-gray-800/80 backdrop-blur-md rounded-2xl p-5 flex flex-col gap-4 shadow-lg transition-all duration-300 hover:border-indigo-500/30 hover:scale-[1.01] hover:shadow-indigo-500/2 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDone(task)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${task.done 
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                        : "border-gray-700 hover:border-indigo-500/60 hover:bg-indigo-500/5"}`}
                  >
                    {task.done && <span className="text-xs">✓</span>}
                  </button>
                  <span className={`flex-1 text-sm font-semibold ${task.done ? "line-through text-gray-500" : "text-gray-200"}`}>
                    {task.name}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${BADGE[level]}`}>{level}</span>
                  {!task.done && (
                    <button
                      onClick={() => getMicroPlan(task)}
                      className="text-xs font-semibold border border-indigo-500/30 text-indigo-400 rounded-xl px-3.5 py-2 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all duration-200"
                    >
                      ✨ Help me start
                    </button>
                  )}
                  <button onClick={() => deleteTask(task._id)} className="text-gray-500 hover:text-red-400 transition-colors duration-200 text-2xl leading-none px-1">×</button>
                </div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${task.done ? "bg-emerald-500" : BAR[task.priority]}`}
                    style={{ width: `${task.done ? 100 : Math.min(100, score)}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs font-semibold text-gray-400">
                  <span>📅 {dlLabel}</span>
                  <span>⏱ {effortStr(task.effort)}</span>
                  {!task.done && <span>Urgency Score: <span className="text-indigo-400">{score}</span>/100</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {aiLoading && (
        <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-5 text-sm text-indigo-400 animate-pulse flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          ✨ Building your micro-plan with Groq...
        </div>
      )}

      {aiPlan && !aiLoading && (
        <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-5 shadow-xl">
          <p className="text-sm font-bold text-indigo-400 mb-4">✨ Your 4-step plan for: {aiPlan.taskName}</p>
          <ol className="flex flex-col gap-3">
            {aiPlan.steps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start text-sm text-gray-200">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
