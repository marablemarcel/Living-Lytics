"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

export function Hero() {
  return (
    <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center max-w-5xl mx-auto min-h-[600px] md:min-h-[700px]">
      {/* Badge / Label */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-ll-cyan/90 shadow-[0_0_15px_rgba(46,232,255,0.15)] backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-ll-green animate-pulse" />
          AI-Powered Analytics 2.0
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
      >
        Turn Your Business Data <br className="hidden md:block" />
        Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-ll-cyan/80">Clear Decisions</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="text-lg md:text-xl text-ll-muted mb-10 max-w-2xl leading-relaxed"
      >
        AI-Powered Analytics for Growth, Clarity, and Competitive Advantage. 
        Start Your Free Trial Today.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="flex flex-col sm:flex-row items-center gap-6"
      >
        <Link
          href="/signup"
          className="group relative px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-ll-blue via-ll-cyan to-ll-green shadow-[0_0_30px_rgba(46,232,255,0.3)] hover:shadow-[0_0_50px_rgba(37,244,166,0.4)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            See Platform in Action 
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Link>
        <button 
          className="flex items-center gap-2 text-white/80 hover:text-ll-cyan hover:drop-shadow-[0_0_10px_rgba(46,232,255,0.5)] transition-all text-base font-medium px-4 py-2"
        >
          <PlayCircle size={20} />
          Watch Demo
        </button>
      </motion.div>
    </section>
  );
}
