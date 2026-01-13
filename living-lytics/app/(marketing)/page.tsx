"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, BarChart2, Zap, Shield, LayoutDashboard, LineChart } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              className="lg:w-1/2 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                New: AI-Powered Insights Engine
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                Turn Data Into <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Actionable Growth
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect your marketing, sales, and web data to get clear, AI-driven recommendations. Stop guessing and start growing.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-gray-50 transition-all w-full sm:w-auto">
                  View Demo
                </Button>
              </div>
              <p className="mt-6 text-sm text-gray-500 flex items-center justify-center lg:justify-start gap-2">
                <Shield className="h-4 w-4" /> No credit card required. Setup in minutes.
              </p>
            </motion.div>

            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative rounded-2xl bg-white shadow-2xl border border-gray-100 p-2 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <img 
                  src="/dashboard-preview.png" 
                  alt="Living Lytics Dashboard" 
                  className="rounded-xl w-full h-auto shadow-sm"
                  onError={(e) => {
                    // Fallback using a div if image is missing, to maintain layout
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-preview') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="fallback-preview hidden w-full aspect-[4/3] bg-gray-50 rounded-xl items-center justify-center flex-col gap-4 border-2 border-dashed border-gray-200">
                   <LayoutDashboard className="h-16 w-16 text-gray-300" />
                   <p className="text-gray-400 font-medium">Dashboard Preview</p>
                </div>

                {/* Floating Cards */}
                <motion.div 
                  className="absolute -left-8 top-20 bg-white p-4 rounded-xl shadow-xl border border-gray-50 max-w-[200px]"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <BarChart2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Conversion Rate</p>
                      <p className="text-sm font-bold text-gray-900">+12.5%</p>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-green-500 rounded-full"></div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -right-8 bottom-20 bg-white p-4 rounded-xl shadow-xl border border-gray-50 max-w-[200px]"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">AI Insight</p>
                      <p className="text-xs font-medium text-gray-900 leading-tight">Ad spend optimization available</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">Trusted by hundreds of data-driven teams</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for logos */}
             {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((company) => (
               <span key={company} className="text-xl font-bold text-gray-400 hover:text-gray-600 cursor-default">{company}</span>
             ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4 inline-block">Features</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Everything You Need to Grow</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Powerful analytics without the complexity. We bring all your data sources together to give you a single source of truth.
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              {
                icon: <LayoutDashboard className="w-6 h-6 text-white" />,
                title: "Unified Dashboard",
                desc: "See all your data in one place. No more tab switching between tools.",
                color: "bg-blue-500"
              },
              {
                icon: <Zap className="w-6 h-6 text-white" />,
                title: "AI Insights",
                desc: "Get actionable recommendations written in plain English, backed by data.",
                color: "bg-indigo-500"
              },
              {
                icon: <LineChart className="w-6 h-6 text-white" />,
                title: "Cross-Data Analysis",
                desc: "Discover hidden relationships between marketing spend and sales.",
                color: "bg-purple-500"
              },
              {
                icon: <Shield className="w-6 h-6 text-white" />,
                title: "Secure & Private",
                desc: "Bank-level encryption. Your data never leaves our secure infrastructure.",
                color: "bg-teal-500"
              },
              {
                icon: <BarChart2 className="w-6 h-6 text-white" />,
                title: "Weekly Reports",
                desc: "Automated reports delivered to your inbox every Monday morning.",
                color: "bg-orange-500"
              },
              {
                icon: <BarChart2 className="w-6 h-6 text-white" />, // Placeholder icon
                title: "Benchmarks",
                desc: "Compare your performance against industry standards and competitors.",
                color: "bg-pink-500"
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
                variants={item}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-gray-200`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-3xl p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Turn Data Into Growth?</h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join hundreds of businesses using Living Lytics to make smarter decisions, faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="h-14 px-8 text-blue-600 bg-white hover:bg-gray-50 border-0 rounded-full font-bold text-lg">
                  Start Your Free Trial
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-white border-blue-400 hover:bg-blue-700 rounded-full font-bold text-lg">
                  Talk to Sales
                </Button>
              </div>
              <p className="mt-8 text-sm text-blue-200 flex items-center justify-center gap-6">
                <span>✓ 14-day free trial</span>
                <span>✓ No credit card required</span>
                <span>✓ Cancel anytime</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
