"use client";

import Link from "next/link";
import { Twitter, Linkedin, Facebook, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#050B14]">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
           
           <div className="flex flex-col items-center md:items-start text-center md:text-left">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-ll-blue to-ll-green flex items-center justify-center text-white text-xs font-bold">L</div>
                <span className="text-lg font-bold text-white">LIVING LYTICS</span>
             </div>
             <p className="text-sm text-ll-muted max-w-xs">
               Empowering businesses with AI-driven insights for a smarter future.
             </p>
           </div>

           <div className="flex flex-wrap justify-center gap-8">
              <Link href="#" className="text-sm text-ll-muted hover:text-white transition">Product</Link>
              <Link href="#" className="text-sm text-ll-muted hover:text-white transition">Features</Link>
              <Link href="#" className="text-sm text-ll-muted hover:text-white transition">Pricing</Link>
              <Link href="#" className="text-sm text-ll-muted hover:text-white transition">Careers</Link>
              <Link href="#" className="text-sm text-ll-muted hover:text-white transition">Privacy</Link>
           </div>

           <div className="flex gap-4">
              <Link href="#" className="text-ll-muted hover:text-white transition"><Twitter size={20}/></Link>
              <Link href="#" className="text-ll-muted hover:text-white transition"><Linkedin size={20}/></Link>
              <Link href="#" className="text-ll-muted hover:text-white transition"><Github size={20}/></Link>
           </div>

        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-ll-muted">
          © {new Date().getFullYear()} Living Lytics. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
