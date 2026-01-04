import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, BrainCircuit, Settings, Search, Bell, 
  ShieldAlert, CheckCircle2, Zap, ArrowRight 
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

interface Patient {
  name: string;
  age: number;
  id: string;
  healthScore: number;
  diagnosis: string;
}

// --- 2. MOCK DATA ---

const LAB_DATA: LabDataPoint[] = [
  { month: 'Jan', glucose: 88, insulin: 5.2 },
  { month: 'Mar', glucose: 89, insulin: 6.8 },
  { month: 'Jun', glucose: 87, insulin: 9.1 },
  { month: 'Sep', glucose: 90, insulin: 14.5 },
  { month: 'Nov', glucose: 89, insulin: 19.2 },
  { month: 'Now', glucose: 91, insulin: 24.8 },
];

const LIFESTYLE_DATA: LifestyleMetric[] = [
  { subject: 'Sleep', A: 50, fullMark: 100 },
  { subject: 'Nutrition', A: 40, fullMark: 100 },
  { subject: 'Movement', A: 65, fullMark: 100 },
  { subject: 'Stress', A: 20, fullMark: 100 },
  { subject: 'Consistency', A: 80, fullMark: 100 },
];

const PATIENT_SARAH: Patient = {
  name: "Sarah Jenkins",
  age: 34,
  id: "AEG-8821",
  healthScore: 62,
  diagnosis: "Pre-Diabetes & Adrenal Fatigue"
};

const INITIAL_CHAT: ChatMessage[] = [
  { 
    id: '1', 
    sender: 'ai', 
    text: "Reviewing Sarah's velocity data. While glucose is stable (89mg/dL avg), fasting insulin has increased by 400% in 12 months.", 
    timestamp: '10:02 AM' 
  },
  {
    id: '2', 
    sender: 'ai', 
    text: "Recommendation: Modify circadian rhythm and increase protein at breakfast to blunt the insulin spike. Shall I generate a protocol?", 
    timestamp: '10:03 AM'
  }
];

// --- 3. SUB-COMPONENTS ---

const Sidebar = () => {
  const navItems = [
    { icon: <Activity size={20} />, label: 'Dashboard', active: true },
    { icon: <Users size={20} />, label: 'Patients', active: false },
    { icon: <BrainCircuit size={20} />, label: 'AI Analytics', active: false },
    { icon: <Settings size={20} />, label: 'Settings', active: false },
  ];

  return (
    <div className="w-20 lg:w-64 h-screen flex flex-col border-r border-white/10 bg-[#020617] relative z-20">
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-white/5">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <Zap className="text-white fill-white" size={16} />
        </div>
        <span className="hidden lg:block ml-3 font-bold text-xl tracking-wide text-white">AEGIS</span>
      </div>
      
      <div className="flex-1 py-8 flex flex-col gap-2">
        {navItems.map((item, idx) => (
          <div 
            key={idx} 
            className={`flex items-center px-4 lg:px-8 py-3 cursor-pointer transition-all duration-200 border-l-2
              ${item.active 
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
          >
            {item.icon}
            <span className="hidden lg:block ml-3 font-medium text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HealthScoreGauge = ({ score }: { score: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r={radius} stroke="#1e293b" strokeWidth="8" fill="transparent" />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="50%" cy="50%" r={radius}
          stroke={score < 70 ? "#f59e0b" : "#10b981"} 
          strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Health Score</span>
      </div>
    </div>
  );
};

const ClinicalVsAegisCard = ({ viewMode, toggleView }: { viewMode: 'clinical' | 'aegis', toggleView: () => void }) => {
  return (
    <div className="glass-panel rounded-2xl p-1 relative overflow-hidden group">
      <motion.div 
        animate={{ opacity: viewMode === 'aegis' ? 0.2 : 0 }}
        className="absolute inset-0 bg-gradient-to-br from-rose-900 via-transparent to-transparent pointer-events-none"
      />
      <div className="flex bg-slate-950/50 rounded-xl p-1 relative z-10">
        <button 
          onClick={toggleView}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
          ${viewMode === 'clinical' ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          {viewMode === 'clinical' && <CheckCircle2 size={16} />}
          Clinical Status
        </button>
        <button 
          onClick={toggleView}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
          ${viewMode === 'aegis' ? 'bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          {viewMode === 'aegis' && <ShieldAlert size={16} className="animate-pulse" />}
          Aegis Insight
        </button>
      </div>
      <div className="p-6">
        <AnimatePresence mode="wait">
          {viewMode === 'clinical' ? (
            <motion.div 
              key="clinical"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-1 rounded bg-emerald-500"></div>
                <div>
                  <h3 className="text-xl font-semibold text-white">All Vitals Normal</h3>
                  <p className="text-slate-400 text-sm">Standard lipid & metabolic panels within range.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-800/50 p-3 rounded border border-white/5">
                  <p className="text-xs text-slate-400">Fasting Glucose</p>
                  <p className="text-lg font-mono text-emerald-400">91 mg/dL</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded border border-white/5">
                  <p className="text-xs text-slate-400">Blood Pressure</p>
                  <p className="text-lg font-mono text-emerald-400">118/78</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="aegis"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-1 rounded bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                <div>
                  <h3 className="text-xl font-semibold text-rose-100">Metabolic Collapse Detected</h3>
                  <p className="text-rose-400/80 text-sm">Hyperinsulinemia compensating for glucose.</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-500/20 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">Prediction Confidence</span>
                  <span className="text-xs font-mono text-rose-300">84%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                  />
                </div>
                <p className="mt-3 text-sm text-white font-medium">Pre-Diabetes & Adrenal Fatigue</p>
                <p className="text-xs text-slate-400">Projected diagnosis: 18 months</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AICopilot = () => {
  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">Aegis Copilot</span>
        </div>
        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {INITIAL_CHAT.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-xl max-w-[90%] text-sm leading-relaxed
              ${msg.sender === 'ai' 
                ? 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none' 
                : 'bg-cyan-600 text-white rounded-tr-none'
              }`}>
              {msg.text}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/10 bg-slate-900/50">
        <div className="relative">
          <input 
            type="text" placeholder="Ask Aegis..." 
            className="w-full bg-slate-950 border border-slate-700 text-sm text-white rounded-lg pl-3 pr-10 py-3 focus:outline-none focus:border-cyan-500/50"
          />
          <button className="absolute right-2 top-2 p-1 bg-cyan-500/20 rounded hover:bg-cyan-500 hover:text-white text-cyan-500 transition-colors">
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. MAIN LAYOUT ---

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'clinical' | 'aegis'>('clinical');

  return (
    <div className="flex w-full min-h-screen bg-[#020617] text-slate-200 font-sans">
      
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Ambient */}
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 z-10 glass-panel bg-opacity-30">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white tracking-tight">Patient Overview</h1>
            <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-xs text-slate-400 font-mono">
              {PATIENT_SARAH.id}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Connection
            </div>
            <div className="relative cursor-pointer hover:text-white">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </div>
            <Search size={20} className="cursor-pointer hover:text-white" />
          </div>
        </header>

        {/* Main Grid */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 z-10 scroll-smooth">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto grid grid-cols-12 gap-6"
          >
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                  <div className="z-10">
                    <h2 className="text-2xl font-bold text-white mb-1">{PATIENT_SARAH.name}</h2>
                    <p className="text-sm text-slate-400 mb-6">{PATIENT_SARAH.age} yrs • Female • O+</p>
                    <div className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border inline-block
                      ${viewMode === 'aegis' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                      {viewMode === 'aegis' ? 'Attention Needed' : 'Stable'}
                    </div>
                  </div>
                  <div className="z-10"><HealthScoreGauge score={PATIENT_SARAH.healthScore} /></div>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
                </div>
                <ClinicalVsAegisCard viewMode={viewMode} toggleView={() => setViewMode(viewMode === 'clinical' ? 'aegis' : 'clinical')} />
              </div>

              {/* Chart Section */}
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-amber-500 relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Insulin vs. Glucose Velocity</h3>
                    <p className="text-sm text-slate-400 mt-1">Identifying <span className="text-amber-400 font-medium">Silent Resistance</span> before A1C spikes.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Glucose</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Insulin</div>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={LAB_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                      <Line type="monotone" dataKey="glucose" stroke="#34d399" strokeWidth={2} dot={{ r: 4, fill: '#34d399', strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="insulin" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-6 flex flex-col h-full">
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Lifestyle Fingerprint</h3>
                <div className="h-[250px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={LIFESTYLE_DATA}>
                      <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Sarah" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex-1 min-h-[300px]"><AICopilot /></div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default App;