"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export const DashboardPreview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.8, 
        ease: "easeOut",
        delay: 0.2
      }}
      className="relative mx-auto mt-16 max-w-5xl px-4 lg:px-8 perspective-1000"
    >
      <div className="relative group">
        {/* Glow Effects */}
        <div className="absolute -inset-1 bg-gradient-to-r from-electric-blue to-emerald-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="absolute -inset-4 bg-gradient-to-r from-electric-blue to-emerald-accent/50 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        
        {/* Card Container */}
        <div className="relative rounded-2xl bg-charcoal/80 border border-white/10 shadow-2xl backdrop-blur-sm overflow-hidden ring-1 ring-white/10">
          <Image
            src="/assets/dashboard-preview.png"
            alt="Living Lytics Dashboard"
            width={1200}
            height={675}
            className="w-full h-auto rounded-xl"
            priority
          />
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
        </div>
      </div>
    </motion.div>
  )
}
