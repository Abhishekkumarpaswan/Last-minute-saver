import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

const PROMPTS = [
  "I have a job interview tomorrow and haven't prepared",
  "Help me prioritize what to do first today",
  "I have a deadline in 2 hours and I'm stuck",
  "What should I focus on right now?",
];

export default function VoiceTab() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [tasks, setTasks] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    api.get("/tasks")
      .then(({ data }) => setTasks(data.filter(t => !t.done)))
      .catch(err => console.error("Error fetching tasks:", err));

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error aborting recognition on unmount:", e);
        }
      }
    };
  }, []);

  const today = new Date(); today.setHours(0,0,0,0);
  const taskContext = tasks.map(t => {
    if (!t.date) {
      return { name: t.name || "Untitled Task", daysLeft: 0, effort: t.effort || 0 };
    }
    const d = new Date(t.date + "T00:00:00");
    const diff = Math.ceil((d - today) / 86400000);
    const daysLeftVal = isNaN(diff) ? 0 : Math.max(0, diff);
    return { name: t.name || "Untitled Task", daysLeft: daysLeftVal, effort: t.effort || 0 };
  });

  const sendToAI = async (text) => {
    setLoading(true); setReply("");
    try {
      const { data } = await api.post("/ai/voice-assist", {
        transcript: text,
        task_context: taskContext,
      });
      setReply(data.reply);
    } catch (err) {
      console.error("Error in voice-assist API:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.detail || "Could not reach AI service. Make sure backend and ai-service are running.";
      setReply(errMsg);
    } finally {
      setLoading(false);
      setStatus("Done");
    }
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Speech recognition not supported in this browser. Use a prompt below.");
      return;
    }

    if (recording) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        console.error("Error stopping SpeechRecognition:", err);
      }
      setRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => { setStatus("Listening..."); setRecording(true); setTranscript(""); };
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setStatus("Got it — asking Groq...");
      sendToAI(text);
    };
    recognition.onerror = (e) => {
      console.error("SpeechRecognition error event:", e.error);
      setStatus("Mic error: " + e.error);
      setRecording(false);
    };
    recognition.onend = () => {
      setRecording(false);
      setStatus(prev => {
        if (prev === "Listening...") {
          return "Ready";
        }
        return prev;
      });
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start SpeechRecognition:", err);
      setStatus("Mic error: " + err.message);
      setRecording(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#121824]/60 border border-gray-800/80 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center gap-5 shadow-xl relative overflow-hidden">
        {/* Glow behind the button */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full blur-[40px] pointer-events-none transition-all duration-500
          ${recording ? "bg-red-500/10 scale-125" : "bg-indigo-500/5"}`} />

        <p className="text-sm text-gray-400 text-center relative z-10 font-medium">Tap the mic and describe your situation — Groq will respond instantly</p>

        <button
          onClick={toggleVoice}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl transition-all duration-300 relative z-10 shadow-lg active:scale-95
            ${recording 
              ? "bg-gradient-to-tr from-red-500 to-rose-600 shadow-red-500/25 scale-105" 
              : "bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/20 hover:scale-[1.03]"}`}
        >
          {recording ? "⏹" : "🎙️"}
        </button>

        <div className="flex flex-col items-center gap-2 relative z-10">
          <p className="text-sm font-semibold text-gray-300">{status}</p>
          {recording && (
            <div className="flex gap-1.5 justify-center items-center h-5 mt-1">
              <span className="w-1 h-3 bg-red-400 rounded-full animate-soundwave" style={{ animationDelay: "0.1s" }} />
              <span className="w-1 h-4 bg-rose-400 rounded-full animate-soundwave" style={{ animationDelay: "0.25s" }} />
              <span className="w-1.5 h-5 bg-purple-400 rounded-full animate-soundwave" style={{ animationDelay: "0.4s" }} />
              <span className="w-1 h-4 bg-indigo-400 rounded-full animate-soundwave" style={{ animationDelay: "0.55s" }} />
              <span className="w-1 h-3 bg-blue-400 rounded-full animate-soundwave" style={{ animationDelay: "0.7s" }} />
            </div>
          )}
        </div>

        {transcript && (
          <div className="w-full bg-[#0a0f18]/60 border border-gray-800 rounded-xl p-4 text-sm text-gray-300 font-semibold italic relative z-10">
            "{transcript}"
          </div>
        )}
      </div>

      {loading && (
        <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-5 text-sm text-indigo-400 animate-pulse flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          ✨ Groq is thinking...
        </div>
      )}

      {reply && !loading && (
        <div className="bg-indigo-955/15 border border-indigo-900/30 rounded-2xl p-5 shadow-xl">
          <p className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider">✨ AI response (via Groq)</p>
          <p className="text-sm text-gray-200 leading-relaxed">{reply}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Try a prompt</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => { setTranscript(p); setStatus("Using prompt..."); sendToAI(p); }}
              className="text-left text-sm border border-gray-800 bg-[#121824]/40 hover:border-indigo-500/40 hover:bg-indigo-500/5 rounded-xl px-4 py-3.5 text-gray-300 transition-all duration-200 font-medium"
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
