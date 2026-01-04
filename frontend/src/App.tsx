import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Users, BrainCircuit, Settings, Search, Bell, ShieldAlert, CheckCircle2, Zap, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';

// --- CONFIGURATION ---
// IF YOU ARE IN CODESPACES: Replace this with the Public URL from your PORTS tab
// Example: const API_URL = "https://your-codespace-name-5000.app.github.dev";
const API_URL = ""; 

// --- TYPES ---
interface LabDataPoint { month: string; glucose: number; insulin: number; }
interface LifestyleMetric { subject: string; A: number; fullMark: number; }
interface ChatMessage { id: string; sender: 'ai' | 'user'; text: string; timestamp: string; }
interface Patient { 
  name: string; age: number; id: string; healthScore: number; diagnosis: string;
  cortisol: number; hrv: number; sleepAvg: number; gender: string;
}

const LIFESTYLE_DATA: LifestyleMetric[] = [
  { subject: 'Sleep', A: 50, fullMark: 100 },
  { subject: 'Nutrition', A: 40, fullMark: 100 },
  { subject: 'Movement', A: 65, fullMark: 100 },
  { subject: 'Stress', A: 20, fullMark: 100 },
  { subject: 'Consistency', A: 80, fullMark: 100 },
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'clinical' | 'aegis'>('clinical');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [labData, setLabData] = useState<LabDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // NEW: Error State
  
  // Chat State
  const [inputMsg, setInputMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ id: '1', sender: 'ai', text: "System Online. Connected to Database. Analysis ready.", timestamp: '10:00 AM' }]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Attempting to fetch from: ${API_URL}/api/patient/random`);
        
        // 1. Get Random ID
        const idRes = await fetch(`${API_URL}/api/patient/random`);
        if (!idRes.ok) throw new Error(`Backend Error: ${idRes.statusText}`);
        const { id } = await idRes.json();

        // 2. Fetch Details
        const pRes = await fetch(`${API_URL}/api/patient/${id}`);
        const pData = await pRes.json();
        setPatient(pData);

        // 3. Fetch Vitals
        const vRes = await fetch(`${API_URL}/api/vitals/${id}`);
        const vData = await vRes.json();
        setLabData(vData);
        
        setLoading(false);
      } catch (err) {
        console.error("Connection Failed:", err);
        setError(err instanceof Error ? err.message : "Unknown Network Error");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;
    const newMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: inputMsg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatHistory(prev => [...prev, newMsg]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMsg.text })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, data]);
    } catch (err) { console.error(err); } finally { setIsTyping(false); }
  };

  // --- ERROR STATE UI ---
  if (error) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] text-rose-500 gap-4 p-8 text-center">
      <AlertTriangle size={48} />
      <h2 className="text-xl font-bold text-white">Connection Failed</h2>
      <p className="max-w-md bg-slate-900 p-4 rounded border border-rose-900/50 font-mono text-sm">{error}</p>
      <div className="text-slate-400 text-sm mt-4">
        <p>If using Codespaces:</p>
        <ol className="list-decimal text-left mt-2 space-y-2 ml-4">
          <li>Go to the <strong>PORTS</strong> tab in VS Code.</li>
          <li>Right click Port <strong>5000</strong> → Set Visibility to <strong>Public</strong>.</li>
          <li>Copy the Port 5000 address.</li>
          <li>Update <code>const API_URL</code> in <code>App.tsx</code> line 8.</li>
        </ol>
      </div>
    </div>
  );

  // --- LOADING STATE UI ---
  if (loading || !patient) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-cyan-500 gap-3">
      <Loader2 className="animate-spin" /> Connecting to Aegis Database...
    </div>
  );

  // --- MAIN UI (Keep your existing UI logic below) ---
  return (
    <div className="flex w-full min-h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none z-0" />
      
      {/* Sidebar */}
      <div className="w-20 lg:w-64 h-screen flex flex-col border-r border-white/5 bg-[#020617]/90 backdrop-blur-md relative z-30">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-white/5">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-glow-cyan"><Zap className="text-white fill-white" size={16} /></div>
          <span className="hidden lg:block ml-3 font-bold text-xl tracking-wide text-white font-sans">AEGIS</span>
        </div>
        <div className="flex-1 py-8 flex flex-col gap-2">
           <div className="flex items-center px-4 lg:px-8 py-3 border-l-2 border-cyan-400 bg-cyan-500/10 text-cyan-300"><Activity size={20} /><span className="hidden lg:block ml-3 font-medium text-sm">Dashboard</span></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-[#020617]/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">Patient Overview</h1>
            <span className="px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800/50 text-[10px] text-slate-400 font-mono">ID: {patient.id}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
            
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                <div className="z-10">
                  <h2 className="text-2xl font-bold text-white mb-1">{patient.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mb-6 uppercase">{patient.age} YRS • {patient.gender}</p>
                  <div className={`px-3 py-1 rounded text-[10px] font-bold uppercase border inline-flex items-center gap-2 ${viewMode === 'aegis' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    {viewMode === 'aegis' ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                    {viewMode === 'aegis' ? 'Attention Needed' : 'Stable'}
                  </div>
                </div>
                {/* Health Gauge Simple */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                   <svg className="w-full h-full -rotate-90"><circle cx="50%" cy="50%" r="40" stroke="#334155" strokeWidth="6" fill="transparent"/><circle cx="50%" cy="50%" r="40" stroke={patient.healthScore < 70 ? "#f59e0b" : "#10b981"} strokeWidth="6" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (patient.healthScore/100)*251} /></svg>
                   <span className="absolute text-2xl font-bold text-white">{patient.healthScore}</span>
                </div>
              </div>

              {/* Biomarkers */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/40">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Cortisol</p>
                  <span className="text-xl font-mono text-white">{patient.cortisol} <span className="text-[10px] text-slate-500">ug/dL</span></span>
                  <div className={`h-1 w-full mt-2 rounded-full ${patient.cortisol > 15 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/40">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">HRV</p>
                  <span className="text-xl font-mono text-white">{patient.hrv} <span className="text-[10px] text-slate-500">ms</span></span>
                  <div className={`h-1 w-full mt-2 rounded-full ${patient.hrv < 40 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/40">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Sleep</p>
                  <span className="text-xl font-mono text-white">{patient.sleepAvg} <span className="text-[10px] text-slate-500">hrs</span></span>
                  <div className={`h-1 w-full mt-2 rounded-full ${patient.sleepAvg < 6 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                </div>
              </div>

              {/* Chart */}
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-amber-500 relative">
                 <h3 className="text-lg font-semibold text-white mb-4">Glucose vs Insulin</h3>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={labData}>
                        <defs>
                          <linearGradient id="colorInsulin" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                        <Area type="monotone" dataKey="insulin" stroke="#f43f5e" strokeWidth={3} fill="url(#colorInsulin)" />
                        <Area type="monotone" dataKey="glucose" stroke="#34d399" strokeWidth={2} fill="transparent" />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </div>

            {/* Right Column (Radar & Chat) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="glass-panel p-6 rounded-2xl h-[250px]">
                   <h3 className="text-sm font-semibold text-white uppercase mb-4">Lifestyle</h3>
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={LIFESTYLE_DATA}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Sarah" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.2} />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
                
                {/* Chat */}
                <div className="glass-panel rounded-2xl h-[300px] flex flex-col p-4">
                   <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                      {chatHistory.map((msg) => (
                        <div key={msg.id} className={`p-2 rounded-lg text-xs ${msg.sender === 'ai' ? 'bg-slate-800 text-slate-300' : 'bg-cyan-900 text-white ml-auto'}`}>{msg.text}</div>
                      ))}
                   </div>
                   <div className="relative">
                      <input value={inputMsg} onChange={e => setInputMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white" placeholder="Ask AI..." />
                      <ArrowRight size={14} className="absolute right-2 top-2.5 text-slate-500" />
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