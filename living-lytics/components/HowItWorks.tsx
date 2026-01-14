"use client";

import { motion } from "framer-motion";
import { Database, Cpu, Rocket } from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Connect Your Data",
    desc: "Seamlessly integrate with your existing date sources, including CRM, marketing, and financial platforms. No coding required.",
    color: "text-ll-cyan",
    gradient: "from-ll-cyan/20 to-transparent"
  },
  {
    icon: Cpu,
    title: "AI Analyzes & Models",
    desc: "Our advanced AI and machine learning algorithms process and model your data to uncover hidden patterns and trends.",
    color: "text-ll-green",
    gradient: "from-ll-green/20 to-transparent"
  },
  {
    icon: Rocket,
    title: "Actionable Insights & Growth",
    desc: "Receive clear, actionable insights and recommendations delivered through intuitive dashboards, enabling smarter business decisions.",
    color: "text-ll-blue",
    gradient: "from-ll-blue/20 to-transparent"
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 relative z-10 px-6">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How Living Lytics Works</h2>
          <p className="text-ll-muted max-w-2xl mx-auto text-lg">
            Three simple steps to transform your raw data into powerful growth opportunities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              className="bg-[#0A0F18] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              {/* Radial Glow Hover Effect */}
              <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${step.gradient} blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${step.color}`}>
                   <step.icon size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                 <p className="text-ll-muted leading-relaxed text-sm">
                   {step.desc}
                 </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
