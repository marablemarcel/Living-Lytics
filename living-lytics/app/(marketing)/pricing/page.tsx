"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const tiers = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for solopreneurs and early-stage startups.",
    features: [
      "3 Data Sources",
      "Daily Data Sync",
      "Basic Dashboard",
      "1 User Seat",
      "Email Support"
    ]
  },
  {
    name: "Growth",
    price: "$99",
    description: "For scaling teams that need deeper insights.",
    features: [
      "Unlimited Data Sources",
      "Hourly Data Sync",
      "Advanced AI Insights",
      "5 User Seats",
      "Priority Support",
      "Custom Reports"
    ],
    popular: true
  },
  {
    name: "Business",
    price: "$249",
    description: "Enterprise-grade power and security.",
    features: [
      "Everything in Growth",
      "Real-time Data Sync",
      "API Access",
      "Unlimited Seats",
      "Dedicated Account Manager",
      "SSO & Audit Logs"
    ]
  }
]

export default function PricingPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the plan that's right for your business. Grow with us as you scale.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl grid grid-cols-1 gap-y-16 sm:gap-y-0 sm:gap-x-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10 ${
                tier.popular ? 'bg-gray-900 ring-gray-900 scale-105 shadow-xl relative z-10' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={tier.name}
                  className={`text-lg font-semibold leading-8 ${tileTextColor(tier.popular)}`}
                >
                  {tier.name}
                </h3>
                {tier.popular && (
                  <span className="rounded-full bg-blue-500 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                    Most Popular
                  </span>
                )}
              </div>
              <p className={`mt-4 text-sm leading-6 ${tileDescColor(tier.popular)}`}>
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className={`text-4xl font-bold tracking-tight ${tileTextColor(tier.popular)}`}>
                  {tier.price}
                </span>
                <span className={`text-sm font-semibold leading-6 ${tileDescColor(tier.popular)}`}>/month</span>
              </p>
              <Button
                variant={tier.popular ? "default" : "outline"}
                className={`mt-6 w-full rounded-full ${tier.popular ? 'bg-blue-600 hover:bg-blue-500' : ''}`}
              >
                Get started today
              </Button>
              <ul role="list" className={`mt-8 space-y-3 text-sm leading-6 ${tileDescColor(tier.popular)}`}>
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className={`h-6 w-5 flex-none ${tier.popular ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function tileTextColor(isPopular: boolean | undefined) {
  return isPopular ? 'text-white' : 'text-gray-900'
}

function tileDescColor(isPopular: boolean | undefined) {
  return isPopular ? 'text-gray-300' : 'text-gray-600'
}
