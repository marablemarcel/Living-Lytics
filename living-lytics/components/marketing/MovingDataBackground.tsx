"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"

export const MovingDataBackground = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth out the mouse movement
  const springConfig = { damping: 25, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Calculate movement - move opposite to mouse
  const x = useTransform(springX, [0, windowSize.width], [20, -20])
  const y = useTransform(springY, [0, windowSize.height], [20, -20])
  const scale = useTransform(springY, [0, windowSize.height], [1.05, 1.1])

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [mouseX, mouseY])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div 
        className="absolute inset-[-5%] w-[110%] h-[110%]"
        style={{ x, y, scale }}
      >
        <Image
          src="/assets/hero-bg.png"
          alt="Abstract Data Waves"
          fill
          className="object-cover opacity-60 mix-blend-screen"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-navy/50 to-navy"></div>
      </motion.div>
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[1px]"></div>
    </div>
  )
}
