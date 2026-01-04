import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, BrainCircuit, Settings, Search, Bell, 
  ShieldAlert, CheckCircle2, Zap, ArrowRight, Loader2
} from 'lucide-react';

// --- 1. TYPES & INTERFACES ---

interface LabDataPoint {
  month: string;
  glucose: number;
  insulin: number;
}

interface LifestyleMetric {
  subject: string;
  A: number;
  fullMark: number;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

// UPDATED PATIENT INTERFACE
interface Patient {
  name: string;
  age: number;
  id: string;
  healthScore: number;
  diagnosis: string;
  // New Attributes from CSV
  cortisol: number;
  hrv: number;
  sleepAvg: number;
  gender: string;
}

const LIFESTYLE_DATA: LifestyleMetric[] = [
  { subject: 'Sleep', A: 50, fullMark: 100 },
  { subject: 'Nutrition', A: 40, fullMark: 100 },
  { subject: 'Movement', A: 65, fullMark: 100 },
  { subject: 'Stress', A: 20, fullMark: 100 },
  { subject: 'Consistency', A: 80, fullMark: 100 },
];

// --- 2. SUB-COMPONENTS ---

const Sidebar = () => (
  <div className="w-20 lg:w-64 h-screen flex flex-col border-r border-white/5 bg-[#020617]/90 backdrop-blur-md relative z-30">
    <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-white/5">
      <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-glow-cyan">
        <Zap className="text-white fill-white" size={16} />
      </div>
      <span className="hidden lg:block ml-3 font-bold text-xl tracking-wide text-white font-sans">AEGIS</span>
    </div>
    <div className="flex-1 py-8 flex flex-col gap-2">
      {[
        { icon: <Activity size={20} />, label: 'Dashboard', active: true },
        { icon: <Users size={20} />, label: 'Patients', active: false },
        { icon: <BrainCircuit size={20} />, label: 'AI Analytics', active: false },
        { icon: <Settings size={20} />, label: 'Settings', active: false },
      ].map((item, idx) => (
        <div key={idx} className={`flex items-center px-4 lg:px-8 py-3 cursor-pointer transition-all duration-200 border-l-2 ${item.active ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300' : 'border-transparent text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
          {item.icon}
          <span className="hidden lg:block ml-3 font-medium text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const HealthScoreGauge = ({ score }: { score: number }) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full"></div>
      <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
        <circle cx="50%" cy="50%" r={radius} stroke="#1e293b" strokeWidth="6" fill="transparent" />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="50%" cy="50%" r={radius}
          stroke={score < 70 ? "#f59e0b" : "#10b981"} 
          strokeWidth="6" fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-white font-mono tracking-tighter">{score}</span>
        <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Health Credit</span>
      </div>
    </div>
  );
};

// --- 3. MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'clinical' | 'aegis'>('clinical');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [labData, setLabData] = useState<LabDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [inputMsg, setInputMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: "System Online. Connected to Database. Analysis ready.", timestamp: '10:00 AM' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // FETCH DATA ON MOUNT (Random Patient)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get a random ID first (Simulate selecting from list)
        const idRes = await fetch('http://localhost:5000/api/patient/random');
        const { id } = await idRes.json();

        // 2. Fetch Patient Info
        const pRes = await fetch(`http://localhost:5000/api/patient/${id}`);
        const pData = await pRes.json();
        setPatient(pData);

        // 3. Fetch Vitals Data
        const vRes = await fetch(`http://localhost:5000/api/vitals/${id}`);
        const vData = await vRes.json();
        setLabData(vData);
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to connect to backend:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, newMsg]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMsg.text })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, data]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // Loading Screen
  if (loading || !patient) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-cyan-500 gap-3">
      <Loader2 className="animate-spin" /> Connecting to Aegis Database...
    </div>
  );

  return (
    <div className="flex w-full min-h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none z-0" />
      <div className="fixed top-[-20%] left-[10%] w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[0%] w-[500px] h-[500px] bg-rose-900/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-[#020617]/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white tracking-tight">Patient Overview</h1>
            <span className="px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800/50 text-[10px] text-slate-400 font-mono tracking-wider">
              ID: {patient.id}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              DB_CONNECTED
            </div>
            <div className="flex gap-4 text-slate-400">
              <Search size={18} className="hover:text-white transition-colors cursor-pointer" />
              <Bell size={18} className="hover:text-white transition-colors cursor-pointer" />
              <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
            
            {/* --- LEFT COLUMN (8/12) --- */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              
              {/* Profile Card */}
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{patient.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mb-6 uppercase">{patient.age} YRS • {patient.gender} • O+ POS</p>
                  <div className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-2
                    ${viewMode === 'aegis' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-glow-rose' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    {viewMode === 'aegis' ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                    {viewMode === 'aegis' ? 'Attention Needed' : 'Stable'}
                  </div>
                </div>
                <HealthScoreGauge score={patient.healthScore} />
              </div>

              {/* --- NEW: BIOMARKER ROW --- */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/40">
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Cortisol</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-xl font-mono text-white">{patient.cortisol}</span>
                    <span className="text-[10px] text-slate-500 mb-1">ug/dL</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${patient.cortisol > 15 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min((patient.cortisol / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/40">
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">HRV (Resilience)</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-xl font-mono text-white">{patient.hrv}</span>
                    <span className="text-[10px] text-slate-500 mb-1">ms</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${patient.hrv < 40 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min((patient.hrv / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/40">
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Avg Sleep</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-xl font-mono text-white">{patient.sleepAvg}</span>
                    <span className="text-[10px] text-slate-500 mb-1">hrs</span>
                  </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${patient.sleepAvg < 6 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min((patient.sleepAvg / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Insight Toggle */}
              <div className="glass-panel rounded-2xl p-1.5 relative overflow-hidden flex flex-col justify-between">
                <div className="flex bg-slate-950/50 rounded-xl p-1 relative z-10">
                  <button onClick={() => setViewMode('clinical')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'clinical' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
                    Clinical
                  </button>
                  <button onClick={() => setViewMode('aegis')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'aegis' ? 'bg-rose-950/40 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'text-slate-500 hover:text-slate-300'}`}>
                    Aegis AI
                  </button>
                </div>
                <div className="flex-1 p-4 flex items-center">
                    <AnimatePresence mode="wait">
                    {viewMode === 'clinical' ? (
                      <motion.div key="clinical" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="w-full">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="text-emerald-500 mt-1" size={20} />
                            <div>
                              <h4 className="text-white font-medium">Standard Vitals Normal</h4>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">No immediate clinical red flags. Lipid profile and HbA1c are within standard reference ranges.</p>
                            </div>
                          </div>
                      </motion.div>
                    ) : (
                      <motion.div key="aegis" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="w-full">
                        <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 mb-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-rose-400 font-bold uppercase">Risk Probability</span>
                              <span className="text-sm font-mono text-rose-300">84%</span>
                            </div>
                            <div className="w-full h-1 bg-rose-950 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 1 }} className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-300"><span className="text-white font-semibold">Diagnosis:</span> {patient.diagnosis}</p>
                      </motion.div>
                    )}
                    </AnimatePresence>
                </div>
              </div>

              {/* Chart */}
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-amber-500 relative overflow-hidden group">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      Insulin vs. Glucose Velocity
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">Live Database</span>
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Identifying <span className="text-amber-400 font-medium">Silent Resistance</span> (HOMA-IR trend)</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium font-mono">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> Glucose</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span> Insulin</div>
                  </div>
                </div>

                <div className="h-[320px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={labData}>
                      <defs>
                        <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInsulin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} fontFamily="monospace" />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dx={-10} fontFamily="monospace" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', backdropFilter: 'blur(8px)' }} 
                        itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                      />
                      <Area type="monotone" dataKey="glucose" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorGlucose)" />
                      <Area type="monotone" dataKey="insulin" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorInsulin)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN (4/12) --- */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              
              {/* Radar Chart */}
              <div className="glass-panel p-6 rounded-2xl h-[280px] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Lifestyle Matrix</h3>
                  <div className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20">
                    <Activity size={12} className="text-rose-400" />
                  </div>
                </div>
                <div className="flex-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={LIFESTYLE_DATA}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Sarah" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Copilot */}
              <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden min-h-[300px]">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={16} className="text-cyan-400" />
                    <span className="text-sm font-semibold text-white">Aegis Server</span>
                  </div>
                  {isTyping && <span className="text-[10px] text-slate-400 animate-pulse">Computing...</span>}
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-[90%] text-xs leading-relaxed border
                        ${msg.sender === 'ai' ? 'bg-slate-800/80 border-slate-700 text-slate-300 rounded-tl-none' : 'bg-cyan-600 border-cyan-500 text-white rounded-tr-none'}`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-600 mt-1 font-mono px-1">{msg.timestamp}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-white/5 bg-black/20">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask Aegis server (try 'protocol' or 'risk')..." 
                      className="w-full bg-[#0b101e] border border-slate-800 text-xs text-white rounded-lg pl-3 pr-10 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600" 
                    />
                    <button onClick={handleSendMessage} className="absolute right-2 top-2 p-1 text-cyan-500 hover:text-white transition-colors"><ArrowRight size={14} /></button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default App;