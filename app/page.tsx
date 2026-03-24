'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LayoutManager } from "@/components/plugin/LayoutManager";
import type { PluginEntry } from "@/types/plugin";

import { DUMMY_ENTRIES } from "@/components/plugin/mockData";

export default function LandingPage() {
  const [activeLayout, setActiveLayout] = useState(1);

  return (
    <div className="flex flex-col bg-background text-foreground font-sans">
      {/* Navigation */}
      <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-10 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/solution22-logo.png" 
              alt="Solution22 Logo" 
              width={100} 
              height={40} 
              priority
              className="object-contain"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#layouts" className="hover:text-primary transition-colors">Layouts</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="default" className="rounded-full px-6">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20  bg-linear-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New layout engine out now!
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Elevate Your WordPress Site with <span className="text-primary">Stunning Layouts</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            The all-in-one SaaS platform for managing premium plugin licenses and delivering high-performance layouts via our global API.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 h-14 text-md shadow-lg shadow-primary/20">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-14 text-md">
              <Link href="/login">Login</Link>
            </Button>
          </div>
          
          {/* <div className="mt-20 relative px-4">
            <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 rounded-full max-w-4xl mx-auto h-64 opacity-30"></div>
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" 
              alt="Dashboard Preview" 
              className="rounded-2xl border shadow-2xl mx-auto max-w-5xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div> */}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-15 border-t">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Everything You Need To Scale</h2>
            <p className="text-muted-foreground">The most robust license and layout management delivery system.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Instant Activation", 
                desc: "Generate and validate license keys in real-time via our high-speed global API.",
                icon: <Zap className="w-10 h-10 text-primary" />
              },
              { 
                title: "Premium Layouts", 
                desc: "Choose from 4 pre-built layouts converted from PHP into high-performance React systems.",
                icon: <Zap className="w-10 h-10 text-primary" />
              },
              { 
                title: "Secure Delivery", 
                desc: "Domain-locked licenses ensure your product is only used where you authorized it.",
                icon: <ShieldCheck className="w-10 h-10 text-primary" />
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl border bg-card hover:shadow-xl transition-all duration-300">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layouts Showcase */}
      <section id="layouts" className="py-15 layouts-section">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 tracking-tight">4 Powerful Layouts, Live Preview</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Switch between all four layouts and see exactly how your plugin content will look on any WordPress site.</p>
          </div>

          {/* Layout Tabs */}
          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            {[1, 2, 3, 4].map((l) => (
              <button
                key={l}
                onClick={() => setActiveLayout(l)}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                  activeLayout === l
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-background border hover:border-primary/50 hover:text-primary'
                }`}
              >
                Layout {l}
              </button>
            ))}
          </div>

          {/* Active Layout */}
          <div className="rounded-2xl border overflow-hidden shadow-xl bg-background">
            <LayoutManager entries={DUMMY_ENTRIES} layout={activeLayout} />
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-15 bg-muted/30 border-y">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Tiered Membership Plans</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {['Basic', 'Pro', 'Enterprise'].map((plan, i) => (
              <div key={i} className={`p-8 rounded-2xl border ${i === 1 ? 'border-primary bg-primary/5 shadow-2xl scale-105' : 'bg-background'}`}>
                <h3 className="text-2xl font-bold mb-2">{plan}</h3>
                <div className="text-4xl font-bold mb-6">${[29, 79, 199][i]}<span className="text-sm text-muted-foreground">/mo</span></div>
                <ul className="space-y-4 text-left mb-8">
                  <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" /> Layout 1 Access</li>
                  <li className="flex items-baseline gap-2 text-sm"><CheckCircle2 className={`w-4 h-4 ${i > 0 ? 'text-primary' : 'text-muted/30'}`} /> Layout 1-3 Access</li>
                  <li className="flex items-baseline gap-2 text-sm"><CheckCircle2 className={`w-4 h-4 ${i > 1 ? 'text-primary' : 'text-muted/30'}`} /> Full Layout (1-4)</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 ">
            <Image 
              src="/solution22-logo.png" 
              alt="Solution22 Logo" 
              width={100} 
              height={40} 
              className="object-contain"
            />
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Solution22. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
