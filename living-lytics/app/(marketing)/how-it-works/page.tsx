"use client"

import { motion } from "framer-motion"

const steps = [
  {
    num: "01",
    title: "Connect Your Data",
    desc: "One-click integrations with Google, Meta, Shopify, and 50+ other tools. We automatically pull your historical data.",
    image: "/connect-step.png"
  },
  {
    num: "02",
    title: "AI Analysis",
    desc: "Our engine cleans, normalizes, and analyzes your data to find correlations and patterns invisible to the human eye.",
    image: "/analysis-step.png"
  },
  {
    num: "03",
    title: "Take Action",
    desc: "Receive clear, prioritized recommendations on how to improve your ROI, lower CAC, and increase LTV.",
    image: "/action-step.png"
  }
]

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">From Chaos to Clarity in 3 Steps</h1>
            <p className="text-xl text-gray-600">
              Living Lytics simplifies the complex world of data analytics into a streamlined process anyone can understand.
            </p>
          </div>

          <div className="space-y-24">
            {steps.map((step, idx) => (
              <motion.div 
                key={step.num}
                className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <div className="lg:w-1/2">
                   <div className="text-6xl font-black text-blue-100 mb-4">{step.num}</div>
                   <h2 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h2>
                   <p className="text-lg text-gray-600 leading-relaxed mb-8">{step.desc}</p>
                   {/* Placeholder visual for the step */}
                </div>
                <div className="lg:w-1/2 w-full">
                  <div className="bg-gray-50 rounded-2xl aspect-video w-full flex items-center justify-center border-2 border-dashed border-gray-200">
                    <span className="text-gray-400 font-medium">Visual for {step.title}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>
    </div>
  )
}
