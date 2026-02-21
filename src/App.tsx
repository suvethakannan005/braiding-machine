import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Info, 
  AlertTriangle, 
  Activity, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronRight,
  Thermometer,
  Zap,
  Wind,
  RotateCcw,
  Bell,
  CheckCircle2,
  Wrench,
  Database,
  Search,
  X,
  ArrowLeft,
  Factory
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Machine {
  id: string;
  name: string;
  type: string;
  serial_number: string;
  purchase_date: string;
  purchase_cost: number;
  warranty_expiry: string;
  supplier_name: string;
  supplier_contact: string;
  company_name: string;
  company_address: string;
  installation_date: string;
  location: string;
  maintenance_schedule: string;
  service_history: string;
  status: 'Active' | 'Fault' | 'Under Maintenance';
}

interface SensorData {
  machineId: string;
  name: string;
  temperature: number;
  vibration: number;
  rpm: number;
  power: number;
  tension: number;
  timestamp: string;
}

interface FaultLog {
  id: number;
  machine_id: string;
  fault_type: string;
  description: string;
  timestamp: string;
}

// --- Components ---

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/assets', icon: Database, label: 'Asset Management' },
    { path: '/info', icon: Info, label: 'Machine Info' },
  ];

  if (location.pathname === '/') return null;

  return (
    <aside className="w-64 bg-black text-white h-screen fixed left-0 top-0 z-50 flex flex-col border-r border-white/10">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-[#00FFFF] rounded-lg flex items-center justify-center">
          <Activity className="text-black" size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[#00FFFF] leading-none">AquaSmart</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Industries</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-[#00FFFF] text-black font-semibold shadow-[0_0_15px_rgba(0,255,255,0.3)]" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-black" : "group-hover:text-[#00FFFF]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>
      </div>
    </aside>
  );
};

const Header = ({ title }: { title: string }) => {
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [faults, setFaults] = useState<FaultLog[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setNotifPermission);
      }
    }
    fetch('/api/faults').then(r => r.json()).then(setFaults);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {!isHome && (
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
        >
          <Search size={20} />
        </button>
        <button 
          onClick={() => setIsNotifOpen(true)}
          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors relative"
        >
          <Bell size={20} />
          {faults.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
        <div 
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-3 pl-4 border-l border-gray-100 ml-2 cursor-pointer group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-900 group-hover:text-[#00FFFF] transition-colors">Mr. Rajesh Kumar</p>
            <p className="text-[10px] text-emerald-500 font-medium">Industry Owner</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-[#00FFFF] transition-all">
            <img src="https://picsum.photos/seed/owner/40/40" alt="Owner Profile" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-24 w-24 rounded-3xl bg-gray-100 border-4 border-[#00FFFF]/20 overflow-hidden">
                  <img src="https://picsum.photos/seed/owner/100/100" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Mr. Rajesh Kumar</h3>
                  <p className="text-emerald-500 font-semibold">Chief Industry Owner</p>
                </div>
                <div className="w-full space-y-3 pt-4">
                  <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-400">Industry Name</span>
                    <span className="font-bold">AquaSmart Industries</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-400">Location</span>
                    <span className="font-bold">Coimbatore, India</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-400">Contact</span>
                    <span className="font-bold">+91 98765 43210</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-400">Email</span>
                    <span className="font-bold">rajesh@aquasmart.com</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors mt-4"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {isNotifOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotifOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="absolute right-4 top-24 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 max-h-[70vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
                <button onClick={() => setIsNotifOpen(false)} className="text-gray-400 hover:text-black">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {faults.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No new notifications</p>
                ) : (
                  faults.map(f => (
                    <div key={f.id} className="p-3 rounded-xl bg-red-50 border border-red-100">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-red-600 uppercase">{f.fault_type}</span>
                        <span className="text-[10px] text-gray-400">{new Date(f.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-700 mt-1">{f.description}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">Machine ID: {f.machine_id}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center gap-4 bg-gray-100 p-4 rounded-2xl border border-gray-200">
                <Search className="text-gray-400" size={24} />
                <input 
                  autoFocus
                  placeholder="Search machines, faults, or assets..."
                  className="bg-transparent border-none outline-none w-full text-lg font-medium"
                />
                <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-black">
                  <X size={24} />
                </button>
              </div>
              <div className="mt-8 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Braider Alpha', 'Fault Logs', 'Maintenance', 'M001'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-[#00FFFF]/10 hover:text-[#00FFFF] cursor-pointer transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
    </div>
    <div className={cn("p-4 rounded-xl", color)}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const SensorChart = ({ data, dataKey, title, color }: { data: any[], dataKey: string, title: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[300px]">
    <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">{title}</h4>
    <ResponsiveContainer width="100%" height="80%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="timestamp" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          labelStyle={{ display: 'none' }}
        />
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2}
          fillOpacity={1} 
          fill={`url(#color${dataKey})`} 
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// --- Pages ---

const Home = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-8 max-w-2xl"
      >
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-[#00FFFF] rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(0,255,255,0.3)]">
            <Factory className="text-black" size={48} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            AQUASMART <span className="text-[#00FFFF]">INDUSTRIES</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
            Next-generation industrial IoT monitoring and asset management system for smart factories.
          </p>
        </div>

        <div className="pt-8">
          <Link 
            to="/dashboard"
            className="group relative inline-flex items-center gap-3 bg-[#00FFFF] text-black px-10 py-5 rounded-2xl font-bold text-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,255,0.5)] active:scale-95"
          >
            <LayoutDashboard size={24} />
            Enter Dashboard
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={24} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-12 opacity-50">
          <div className="text-center">
            <p className="text-[#00FFFF] font-bold text-2xl">24/7</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Monitoring</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-[#00FFFF] font-bold text-2xl">100%</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Real-time</p>
          </div>
          <div className="text-center">
            <p className="text-[#00FFFF] font-bold text-2xl">AI</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Fault Detection</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [sensorHistory, setSensorHistory] = useState<Record<string, SensorData[]>>({});
  const [faults, setFaults] = useState<FaultLog[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [mobileNotification, setMobileNotification] = useState<any | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    fetch('/api/machines').then(r => r.json()).then(setMachines);
    fetch('/api/faults').then(r => r.json()).then(setFaults);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${window.location.host}`);

    ws.current.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'SENSOR_UPDATE') {
        const newData = payload.data as SensorData[];
        setSensorHistory(prev => {
          const updated = { ...prev };
          newData.forEach(d => {
            if (!updated[d.machineId]) updated[d.machineId] = [];
            updated[d.machineId] = [...updated[d.machineId], d].slice(-20);
          });
          return updated;
        });
      } else if (payload.type === 'FAULT_ALERT') {
        const alertData = payload.data;
        setAlerts(prev => [alertData, ...prev].slice(0, 5));
        
        // Trigger Mobile Simulation
        setMobileNotification(alertData);
        setTimeout(() => setMobileNotification(null), 5000);

        // Trigger Browser Notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("⚠️ CRITICAL MACHINE FAULT", {
            body: `${alertData.machineName} (${alertData.machineId}): ${alertData.faultType}`,
            icon: "https://cdn-icons-png.flaticon.com/512/564/564619.png"
          });
        }

        // Refresh machines and faults
        fetch('/api/machines').then(r => r.json()).then(setMachines);
        fetch('/api/faults').then(r => r.json()).then(setFaults);
      }
    };

    return () => ws.current?.close();
  }, []);

  const stats = {
    total: machines.length,
    active: machines.filter(m => m.status === 'Active').length,
    fault: machines.filter(m => m.status === 'Fault').length,
    maintenance: machines.filter(m => m.status === 'Under Maintenance').length,
  };

  return (
    <div className="space-y-8">
      {/* Mobile Notification Simulation */}
      <AnimatePresence>
        {mobileNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -100, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[100] w-[90%] max-w-[350px]"
          >
            <div className="bg-black/90 backdrop-blur-md text-white p-4 rounded-3xl shadow-2xl border border-white/10 flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-[#00FFFF] uppercase tracking-widest">AquaSmart Alert</span>
                  <span className="text-[10px] text-gray-400">Now</span>
                </div>
                <p className="text-sm font-bold leading-tight">Critical Fault: {mobileNotification.faultType}</p>
                <p className="text-xs text-gray-400">{mobileNotification.machineName} requires immediate attention.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts Section */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-500" />
                  <div>
                    <p className="font-bold text-red-900">CRITICAL FAULT DETECTED</p>
                    <p className="text-red-700 text-sm">
                      {alert.machineName} ({alert.machineId}) - {alert.faultType}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setAlerts(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-600"
                >
                  <X size={20} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Machines" value={stats.total} icon={Database} color="bg-black" />
        <StatCard label="Active Now" value={stats.active} icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard label="Fault Alerts" value={stats.fault} icon={AlertTriangle} color="bg-red-500" />
        <StatCard label="Maintenance Due" value={stats.maintenance} icon={Wrench} color="bg-amber-500" />
      </div>

      {/* Real-time Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Live Sensor Overview</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FFFF]" /> Temp
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Vibration
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machines.slice(0, 4).map(m => {
                const history = sensorHistory[m.id] || [];
                return (
                  <div key={m.id} className="border border-gray-50 rounded-xl p-4 hover:border-[#00FFFF]/30 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-gray-700">{m.name}</span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                        m.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {m.status}
                      </span>
                    </div>
                    <div className="h-32">
                      <SensorChart 
                        data={history} 
                        dataKey="temperature" 
                        title="" 
                        color={m.status === 'Fault' ? '#ef4444' : '#00FFFF'} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fault Logs */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Fault Logs</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {faults.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle2 className="mx-auto mb-2 opacity-20" size={48} />
                <p>No recent faults detected</p>
              </div>
            ) : (
              faults.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-red-600 text-sm">{log.fault_type}</span>
                    <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{log.description}</p>
                  <div className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                    <Activity size={10} /> Machine ID: {log.machine_id}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetManagement = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Partial<Machine> | null>(null);

  const fetchMachines = () => fetch('/api/machines').then(r => r.json()).then(setMachines);

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingMachine?.id && machines.find(m => m.id === editingMachine.id) ? 'PUT' : 'POST';
    const url = method === 'PUT' ? `/api/machines/${editingMachine?.id}` : '/api/machines';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingMachine)
    });

    setIsModalOpen(false);
    setEditingMachine(null);
    fetchMachines();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this machine?')) {
      await fetch(`/api/machines/${id}`, { method: 'DELETE' });
      fetchMachines();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-500">Manage your industrial assets and maintenance schedules.</p>
        <button 
          onClick={() => { setEditingMachine({}); setIsModalOpen(true); }}
          className="bg-[#00FFFF] text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all"
        >
          <Plus size={20} /> Add New Machine
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Machine Details</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type & Serial</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {machines.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{m.name}</div>
                  <div className="text-xs text-gray-400">ID: {m.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700">{m.type}</div>
                  <div className="text-xs text-gray-400">{m.serial_number}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{m.location}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                    m.status === 'Active' ? "bg-emerald-100 text-emerald-700" : 
                    m.status === 'Fault' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingMachine(m); setIsModalOpen(true); }}
                      className="p-2 text-gray-400 hover:text-[#00FFFF] hover:bg-[#00FFFF]/10 rounded-lg transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(m.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingMachine?.id ? 'Edit Machine Details' : 'Register New Machine'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest border-b pb-2">Basic Information</h4>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Machine ID</label>
                    <input 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF]/20 outline-none transition-all"
                      value={editingMachine?.id || ''}
                      onChange={e => setEditingMachine({...editingMachine, id: e.target.value})}
                      placeholder="e.g. M004"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Machine Name</label>
                    <input 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF]/20 outline-none transition-all"
                      value={editingMachine?.name || ''}
                      onChange={e => setEditingMachine({...editingMachine, name: e.target.value})}
                      placeholder="e.g. Braider Alpha"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Machine Type</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF]/20 outline-none transition-all"
                      value={editingMachine?.type || 'Braiding Machine'}
                      onChange={e => setEditingMachine({...editingMachine, type: e.target.value})}
                    >
                      <option>Braiding Machine</option>
                      <option>Winding Machine</option>
                      <option>Twisting Machine</option>
                      <option>Spooling Machine</option>
                      <option>Cutting Machine</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Serial Number</label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF]/20 outline-none transition-all"
                      value={editingMachine?.serial_number || ''}
                      onChange={e => setEditingMachine({...editingMachine, serial_number: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest border-b pb-2">Purchase & Location</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">Purchase Date</label>
                      <input 
                        type="date"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF]/20 outline-none transition-all"
                        value={editingMachine?.purchase_date || ''}
                        onChange={e => setEditingMachine({...editingMachine, purchase_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">Cost ($)</label>
                      <input 
                        type="number"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF]/20 outline-none transition-all"
                        value={editingMachine?.purchase_cost || ''}
                        onChange={e => setEditingMachine({...editingMachine, purchase_cost: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Location inside Industry</label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF]/20 outline-none transition-all"
                      value={editingMachine?.location || ''}
                      onChange={e => setEditingMachine({...editingMachine, location: e.target.value})}
                      placeholder="e.g. Floor A - Section 1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Status</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF]/20 outline-none transition-all"
                      value={editingMachine?.status || 'Active'}
                      onChange={e => setEditingMachine({...editingMachine, status: e.target.value as any})}
                    >
                      <option value="Active">Active</option>
                      <option value="Fault">Fault</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-10 py-3 rounded-xl font-bold bg-[#00FFFF] text-black hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all"
                  >
                    Save Machine
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MachineInfo = () => {
  const infoData = [
    {
      title: "Braiding Machine",
      principle: "Intertwines three or more strands of yarn or wire to create a tubular or flat structure. Used for ropes, cables, and medical stents.",
      faults: "Thread breakage, bobbin misalignment, tension fluctuation, motor overheating.",
      tips: "Regularly lubricate moving parts, check thread tension sensors, clean dust from bobbins.",
      iot: "Tension monitoring, RPM tracking, temperature sensing on motor housing."
    },
    {
      title: "Winding Machine",
      principle: "Wraps yarn, wire, or thread onto a spool or bobbin at high speeds with precise tension control.",
      faults: "Uneven winding, spool slippage, speed variance, vibration in spindle.",
      tips: "Calibrate speed controllers, inspect spool holders for wear, ensure clean environment.",
      iot: "Vibration analysis, speed synchronization monitoring, spool weight detection."
    },
    {
      title: "Twisting Machine",
      principle: "Twists multiple strands of yarn together to increase strength and durability of the final thread.",
      faults: "Twist irregularity, spindle noise, belt slippage, power fluctuations.",
      tips: "Check belt tension weekly, monitor spindle bearings, maintain constant power supply.",
      iot: "Power consumption monitoring, acoustic fault detection, twist-per-inch verification."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {infoData.map((item, i) => (
        <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
              <Settings className="text-[#00FFFF]" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-[#00FFFF] uppercase tracking-widest mb-1">Working Principle</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{item.principle}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Common Faults</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{item.faults}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Maintenance Tips</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{item.tips}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">IoT Monitoring Possibilities</h4>
              <p className="text-sm text-gray-700 italic">{item.iot}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <Sidebar />
      <main className={cn(
        "flex-1 min-h-screen flex flex-col transition-all duration-300",
        !isHome ? "ml-64" : "ml-0"
      )}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={
            <>
              <Header title="Industrial Overview" />
              <div className="p-8"><Dashboard /></div>
            </>
          } />
          <Route path="/assets" element={
            <>
              <Header title="Asset Management" />
              <div className="p-8"><AssetManagement /></div>
            </>
          } />
          <Route path="/info" element={
            <>
              <Header title="Machine Knowledge Base" />
              <div className="p-8"><MachineInfo /></div>
            </>
          } />
        </Routes>
      </main>
    </div>
  );
}
