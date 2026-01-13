"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { BarChart2, Zap, Shield, Globe, Users, Database } from "lucide-react"

const features = [
  {
    title: "Unified Dashboard",
    description: "Aggregates data from Google Analytics, Meta Ads, Shopify, and more into a single, real-time view.",
    icon: <Globe className="w-6 h-6" />,
    color: "bg-blue-500"
  },
  {
    title: "AI-Powered Insights",
    description: "Our AI engine analyzes your data 24/7 to find anomalies, opportunities, and trends you might miss.",
    icon: <Zap className="w-6 h-6" />,
    color: "bg-indigo-500"
  },
  {
    title: "Team Collaboration",
    description: "Share dashboards, annotate charts, and tag team members to drive alignment and action.",
    icon: <Users className="w-6 h-6" />,
    color: "bg-purple-500"
  },
  {
    title: "Automated Reporting",
    description: "Schedule beautiful PDF or email reports to be sent to your inbox or clients automatically.",
    icon: <BarChart2 className="w-6 h-6" />,
    color: "bg-orange-500"
  },
  {
    title: "Data Warehousing",
    description: "We store your historical data securely, allowing you to look back years, not just months.",
    icon: <Database className="w-6 h-6" />,
    color: "bg-teal-500"
  },
  {
    title: "Enterprise Security",
    description: "SOC 2 Type II compliant, with role-based access control and audit logs.",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-pink-500"
  }
]

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Capabilities that Drive Growth
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Explore the tools and features that make Living Lytics the choice for data-driven companies.
          </motion.p>
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button size="lg" className="rounded-full px-8 bg-blue-600 hover:bg-blue-700">Get Started Free</Button>
          </motion.div>
        </div>
      </section>

      {/* Feature Blocks */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                className="flex flex-col items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center text-white shadow-lg mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Feature Section */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">AI that actually understands your business</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Most analytics tools just show you charts. Living Lytics explains what those charts mean. Our AI analyzes correlation between your channels to tell you exactly where to spend your next dollar.
              </p>
              <ul className="space-y-4">
                {[
                  "Natural language queries",
                  "Anomaly detection",
                  "Predictive forecasting",
                  "Automated budget allocation"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">✓</div>
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 relative">
               <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
               <div className="relative bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl">
                 {/* Abstract UI representation */}
                 <div className="space-y-4">
                   <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                   <div className="h-32 bg-gray-700/50 rounded-lg w-full"></div>
                   <div className="flex gap-4">
                     <div className="h-8 bg-blue-600 rounded w-1/4"></div>
                     <div className="h-8 bg-gray-700 rounded w-1/4"></div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
