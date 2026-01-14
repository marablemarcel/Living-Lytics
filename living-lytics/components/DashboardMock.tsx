"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { 
  BarChart, 
  Activity, 
  Users, 
  CreditCard, 
  PieChart, 
  MoreHorizontal, 
  Bell, 
  Search,
  ArrowUpRight,
  TrendingUp,
  Globe
} from "lucide-react";

export function DashboardMock() {
  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 50, damping: 10 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 10 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = event.clientX - rect.left;
    const mouseYPos = event.clientY - rect.top;
    
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative z-20 w-full max-w-6xl mx-auto px-4 perspective-1000 -mt-10 mb-20 md:mb-32"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full relative group rounded-3xl bg-white/[0.03] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-md p-2 md:p-4 overflow-hidden"
      >
        {/* Inner Highlight/Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-20 pointer-events-none rounded-3xl" />
        
        {/* Dashboard Content Container */}
        <div className="relative bg-[#0F1115]/80 rounded-2xl w-full h-[500px] md:h-[650px] flex overflow-hidden border border-white/5">
          
          {/* Sidebar */}
          <div className="hidden md:flex flex-col w-20 border-r border-white/5 items-center py-6 gap-6 bg-white/[0.01]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ll-blue to-ll-green mb-4 shadow-[0_0_15px_rgba(47,123,255,0.4)]" />
            <div className="p-3 rounded-lg bg-white/5 text-ll-cyan"><PieChart size={20}/></div>
            <div className="p-3 rounded-lg text-white/40 hover:text-white/80 transition cursor-pointer"><Activity size={20}/></div>
            <div className="p-3 rounded-lg text-white/40 hover:text-white/80 transition cursor-pointer"><Users size={20}/></div>
            <div className="p-3 rounded-lg text-white/40 hover:text-white/80 transition cursor-pointer"><CreditCard size={20}/></div>
            <div className="mt-auto p-3 rounded-full overflow-hidden border border-white/10">
               <div className="w-8 h-8 bg-gray-600 rounded-full" /> 
               {/* Mock Avatar */}
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-2xl font-semibold text-white">Dashboard</h3>
                  <p className="text-sm text-ll-muted mt-1">Real-time overview</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-ll-muted w-64">
                    <Search size={16} />
                    <span>Search anything...</span>
                  </div>
                  <div className="p-2 rounded-lg border border-white/10 text-white/60 relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-ll-green animate-pulse" />
                  </div>
               </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <MockStatCard label="Total Revenue" value="$1.2M" delta="+15%" positive={true} />
               <MockStatCard label="Active Users" value="85K" delta="+16%" positive={true} />
               <MockStatCard label="Customer Churn" value="2.1%" delta="-0.8%" positive={true} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
               {/* Chart Area */}
               <div className="lg:col-span-2 bg-white/[0.02] rounded-2xl border border-white/5 p-6 flex flex-col relative overflow-hidden group/chart">
                  <div className="flex justify-between items-center mb-6">
                     <h4 className="text-white/90 font-medium">Q3 Revenue Growth</h4>
                     <button className="text-xs px-3 py-1 rounded bg-white/5 text-white/60">Last 6 Months</button>
                  </div>
                  
                  {/* Mock Line Chart */}
                  <div className="flex-1 w-full relative flex items-end justify-between gap-2 px-2 pb-4">
                     {/* Gradient Stroke emulation */}
                     <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" preserveAspectRatio="none">
                         <defs>
                             <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                                 <stop offset="0%" stopColor="rgba(37, 244, 166, 0.2)" />
                                 <stop offset="100%" stopColor="rgba(37, 244, 166, 0)" />
                             </linearGradient>
                         </defs>
                         <path 
                           d="M0,150 C100,100 200,180 300,120 S500,50 600,80 S800,20 1000,40" 
                           fill="none" 
                           stroke="#25F4A6" 
                           strokeWidth="3"
                           className="drop-shadow-[0_0_10px_rgba(37,244,166,0.3)]"
                           vectorEffect="non-scaling-stroke"
                         />
                         <path 
                           d="M0,150 C100,100 200,180 300,120 S500,50 600,80 S800,20 1000,40 V300 H0 Z" 
                           fill="url(#chartGrad)" 
                           vectorEffect="non-scaling-stroke"
                           opacity="0.5"
                         />
                     </svg>
                     
                     {/* Floating tooltip mock */}
                     <div className="absolute top-[30%] left-[60%] bg-[#1A1F29]/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md transform -translate-x-1/2 -translate-y-1/2">
                        <div className="text-xs text-ll-muted mb-1">03 Revenue</div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          $1.2M <span className="text-ll-green text-xs">+112%</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Side Panel / AI Insights */}
               <div className="flex flex-col gap-6">
                 {/* AI Insight Card */}
                 <div className="bg-gradient-to-br from-ll-blue/10 to-transparent rounded-2xl border border-ll-blue/20 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20"><TrendingUp size={40} className="text-ll-blue"/></div>
                    <h4 className="text-white/90 font-medium mb-1 flex items-center gap-2"><span className="w-2 h-2 bg-ll-blue rounded-full"/> AI Insights</h4>
                    <p className="text-2xl font-bold text-white mb-2">3 New Opps</p>
                    <p className="text-xs text-ll-muted">High probability opportunities found in APAC region.</p>
                 </div>

                 {/* Bar Chart Mock */}
                 <div className="flex-1 bg-white/[0.02] rounded-2xl border border-white/5 p-5 flex flex-col">
                    <h4 className="text-white/90 font-medium mb-4">Sales by Region</h4>
                    <div className="flex-1 flex items-end justify-between gap-3 relative">
                       {[40, 60, 35, 80, 55, 70, 45].map((h, i) => (
                          <div key={i} className="flex-1 bg-white/5 rounded-t-sm hover:bg-ll-blue transition-colors relative group" style={{ height: `${h}%` }}>
                              {i === 3 && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A1F29] border border-white/10 text-[10px] text-white px-2 py-1 rounded whitespace-nowrap">
                                  Leading
                                </div>
                              )}
                              <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-ll-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                       ))}
                    </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

function MockStatCard({ label, value, delta, positive }: { label: string, value: string, delta: string, positive: boolean }) {
  return (
    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
       <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
       <h4 className="text-ll-muted text-sm font-medium mb-2">{label}</h4>
       <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-white">{value}</span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${positive ? 'bg-ll-green/10 text-ll-green' : 'bg-red-500/10 text-red-400'}`}>
            {delta}
          </span>
       </div>
    </div>
  )
}
