import type { Metadata } from 'next';
import { Hero } from "@/components/Hero";
import { DashboardMock } from "@/components/DashboardMock";
import { HowItWorks } from "@/components/HowItWorks";
import { DataWaveBackground } from "@/components/DataWaveBackground";

export const metadata: Metadata = {
  title: "Living Lytics - Turn Business Data into Clear Decisions",
  description: "AI-Powered Analytics for Growth, Clarity, and Competitive Advantage. Start your free trial today.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://livinglytics.com',
    title: 'Living Lytics - AI Business Intelligence',
    description: 'Transform your raw data into actionable insights.',
    siteName: 'Living Lytics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Living Lytics',
    description: 'AI-Powered Analytics for Growth.',
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Scoped Background */}
      <div className="relative overflow-hidden">
        <DataWaveBackground />
        <Hero />
      </div>
      
      {/* Dashboard positioned to overlap the wave background slightly */}
      <div className="relative -mt-10">
        <DashboardMock />
      </div>
      
      {/* Clean dark background from here down */}
      <HowItWorks />
      
      {/* Additional spacing */}
      <div className="h-20" />
    </div>
  );
}
