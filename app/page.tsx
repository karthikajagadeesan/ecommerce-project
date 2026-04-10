'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layout as LayoutIcon, 
  Shield, 
  Layers, 
  Globe, 
  Lock, 
  ChevronRight,
  Star,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { LayoutManager } from "@/components/plugin/LayoutManager";
import type { PluginEntry } from "@/types/plugin";
import { DUMMY_ENTRIES } from "@/components/plugin/mockData";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

// Simple Reveal Component
const Reveal = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("reveal", isVisible && "is-visible", className)}>
      {children}
    </div>
  );
};

export default function LandingPage() {
  const [activeLayout, setActiveLayout] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col bg-background text-ui-text-main font-sans selection:bg-ui-bg-blue-soft antialiased scroll-smooth">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-ui-white z-50 border-b border-ui-border-blue transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-25 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image 
              src="/solution22-logo.png" 
              alt="Solution22 Logo" 
              width={140} 
              height={68} 
              priority
              className="object-contain"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-ui-text-muted absolute left-1/2 -translate-x-1/2">
            <a href="#features" className="hover:text-ui-blue transition-colors">Features</a>
            <a href="#layouts" className="hover:text-ui-blue transition-colors">Layouts</a>
            <a href="#pricing" className="hover:text-ui-blue transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-ui-blue transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild size="lg" className="gradient-primary rounded-full px-8 font-medium">
              <Link href="/login">Login</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              className="gradient-primary rounded-full px-8 h-10 text-[14px] font-medium"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Initial Reveal */}
      <section className="pt-38 pb-10 bg-ui-bg-blue relative overflow-hidden">
        <Reveal className="container mx-auto px-6 text-center relative z-10 transition-delay-0">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ui-badge-bg border border-ui-border-blue text-ui-badge-text text-[14px] font-medium mb-12 shadow-sm animate-bounce-subtle">
            <div className="w-2.5 h-2.5 rounded-full bg-ui-badge-dot shadow-sm" />
            <span>New layout engine out now!</span>
          </div>
          <h1 className="text-[48px] md:text-[60px] font-normal text-ui-text-main tracking-tight mb-8 max-w-5xl mx-auto leading-[1.1]">
            Elevate Your WordPress Site with <br/>
            <span className="text-transparent bg-clip-text gradient-primary">Stunning Layouts</span>
          </h1>
          <p className="text-[18px] md:text-[20px] text-ui-text-muted mb-14 max-w-2xl mx-auto leading-relaxed">
            The all-in-one SaaS platform for managing premium plugin licenses and <br className="hidden md:block" /> delivering high-performance layouts via our global API.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
            <Button asChild size="lg" className="gradient-primary rounded-full px-12 h-14 text-[16px] font-bold shadow-lg shadow-ui-blue/20">
              <Link href="/signup">
                Get Started →
              </Link>
            </Button>
          </div>
          
          {/* Hero Badges */}
          <div className="flex flex-wrap items-center justify-center gap-10 text-[15px] font-medium text-ui-text-muted">
            <div className="flex items-center gap-3 hover:translate-y-[-2px] transition-transform">
              <div className="w-7 h-7 rounded-full bg-ui-bg-indigo-soft flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-ui-cyan" />
              </div>
              Instant Activation
            </div>
            <div className="flex items-center gap-3 hover:translate-y-[-2px] transition-transform">
              <div className="w-7 h-7 rounded-full bg-ui-bg-indigo-soft flex items-center justify-center">
                <LayoutIcon className="w-4 h-4 text-ui-cyan" />
              </div>
              Premium Layouts
            </div>
            <div className="flex items-center gap-3 hover:translate-y-[-2px] transition-transform">
              <div className="w-7 h-7 rounded-full bg-ui-bg-indigo-soft flex items-center justify-center">
                <Shield className="w-4 h-4 text-ui-cyan" />
              </div>
              Secure Delivery
            </div>
          </div>
        </Reveal>
      </section>

      {/* Features Section */}
      <section id="features" className="py-15">
        <div className="container mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-ui-sky font-bold text-[14px] uppercase tracking-[2px] mb-3">Features Overview</p>
            <h2 className="text-[36px] md:text-[40px] font-bold text-ui-text-main mb-3 tracking-tight">Everything You Need To Scale</h2>
            <p className="text-ui-text-muted text-[17px] max-w-2xl mx-auto leading-relaxed">The most robust license and layout management delivery system built to <br/> ensure WordPress solutions.</p>
          </Reveal>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {[
              { 
                title: "Instant Activation", 
                desc: "Generate and validate license keys in real-time via our high-speed global API with zero-latency response times.",
                icon: <Zap className="w-6 h-7 text-ui-sky" />,
                bg: "bg-ui-bg-sky-soft"
              },
              { 
                title: "Premium Layouts", 
                desc: "Generate and validate license keys in real-time via our high-speed global API with zero-latency response times.",
                icon: <Layers className="w-6 h-6 text-ui-blue" />,
                bg: "bg-ui-bg-indigo-soft"
              },
              { 
                title: "Secure Delivery", 
                desc: "Domain-locked licenses ensure your product is only used where you authorized it with enterprise-grade security.",
                icon: <ShieldCheck className="w-6 h-6 text-ui-cyan" />,
                bg: "bg-ui-bg-teal-soft"
              },
              { 
                title: "Real-Time Analytics", 
                desc: "Monitor activations, usage, and license health from a single clean dashboard updated in real-time.",
                icon: <Globe className="w-6 h-6 text-ui-sky" />,
                bg: "bg-ui-bg-sky-soft"
              },
              { 
                title: "Team Collaboration", 
                desc: "Invite team members, assign roles, and manage product licenses together with granular permission controls.",
                icon: <ShieldCheck className="w-6 h-6 text-ui-blue" />,
                bg: "bg-ui-bg-indigo-soft"
              },
              { 
                title: "Developer API", 
                desc: "Full REST API access with SDKs for PHP, JavaScript, and Python. Integrate in minutes, not days.",
                icon: <Lock className="w-6 h-6 text-ui-cyan" />,
                bg: "bg-ui-bg-teal-soft"
              }
            ].map((feature, idx) => (
              <Reveal key={idx} className={cn("delay-[", idx * 100, "ms]")}>
                <div className="p-8 h-full rounded-[24px] border border-ui-border-blue bg-ui-white shadow-sm hover:shadow-2xl hover:shadow-sky-100/60 transition-all duration-500 group cursor-default">
                  <div className={cn("w-12 h-12 rounded-[5px] flex items-center justify-center mb-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm", feature.bg)}>
                    {feature.icon}
                  </div>
                  <h3 className="text-[22px] font-bold text-ui-text-main mb-5 tracking-tight group-hover:text-ui-blue transition-colors">{feature.title}</h3>
                  <p className="text-ui-text-muted text-[16px] leading-relaxed italic-none">{feature.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Layouts Showcase */}
      <section id="layouts" className="py-15 gradient-reverse scroll-mt-25">
        <div className="container mx-auto px-6">
          <Reveal className="text-center mb-10">
            <p className="text-ui-sky font-bold text-[14px] uppercase tracking-[2px] mb-3">LIVE PREVIEW</p>
            <h2 className="text-[36px] md:text-[40px] font-bold text-ui-text-main mb-3 tracking-tight">4 Powerful Layouts, Live Preview</h2>
            <p className="text-ui-text-muted text-[17px] max-w-2xl mx-auto  leading-relaxed">Switch between all four layouts and see exactly how your plugin content will look on <br/> any WordPress site.</p>
          </Reveal>

          {/* Layout Tabs */}
          <Reveal className="flex justify-center gap-4 mb-12">
            {[1, 2, 3, 4].map((l) => (
              <button
                key={l}
                onClick={() => setActiveLayout(l)}
                className={cn(
                  "px-8 py-2.5 rounded-full font-bold text-[15px] transition-all duration-400 transform hover:scale-105",
                  activeLayout === l
                    ? "gradient-primary text-ui-white shadow-xl shadow-ui-blue/25"
                    : "bg-ui-white text-ui-text-muted border border-ui-border-blue hover:border-ui-blue/40 hover:text-ui-blue shadow-sm"
                )}
              >
                Layout {l}
              </button>
            ))}
          </Reveal>

          {/* Layout Card */}
          <Reveal className="max-w-7xl mx-auto rounded-2xl bg-ui-white/50 backdrop-blur-sm p-4 overflow-hidden border border-ui-border-blue shadow-lg">
            <div className=" transition-all duration-700 ease-in-out">
               <LayoutManager entries={DUMMY_ENTRIES} layout={activeLayout} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-15 bg-ui-bg-blue">
        <div className="container mx-auto px-6 text-center">
          <Reveal className="text-center mb-24">
            <p className="text-ui-sky font-bold text-[14px] uppercase tracking-[2px] mb-3">EASY PROCESS</p>
            <h2 className="text-[36px] md:text-[40px] font-bold text-ui-text-main mb-3 tracking-tight">How It Works</h2>
            <p className="text-ui-text-muted text-[17px] max-w-2xl mx-auto leading-relaxed">Start your application journey with a simple process that anyone can navigate.</p>
          </Reveal>
          
          <div className="grid md:grid-cols-4 gap-12 relative max-w-6xl mx-auto">
             <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] border-t-2 border-dashed border-sky-300 opacity-40"></div>
            {[
              { step: "1", title: "Choose a Layout", desc: "Browse our collection of high performance layouts." },
              { step: "2", title: "Purchase a License", desc: "Select the plan that fits your project needs." },
              { step: "3", title: "Connect Domain", desc: "Enter your domain to lock the license for security." },
              { step: "4", title: "Go Live", desc: "Embed the script and watch your site transform instantly." }
            ].map((s, i) => (
              <Reveal key={i} className={cn("delay-[", i * 150, "ms] flex flex-col items-center group relative z-10 transition-transform duration-500 hover:-translate-y-2")}>
                <div className="w-[85px] h-[85px] rounded-full gradient-primary flex items-center justify-center text-ui-white text-[38px] font-bold mb-10 shadow-2xl shadow-ui-blue/30 ring-[10px] ring-white transition-all group-hover:scale-110 group-hover:ring-[12px]">
                  {s.step}
                </div>
                <h3 className="text-[22px] font-bold text-ui-text-main mb-4 tracking-tight group-hover:text-ui-blue transition-colors">{s.title}</h3>
                <p className="text-ui-text-muted text-[15px] leading-relaxed max-w-[220px] italic-none font-medium text-opacity-90">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section id="pricing" className="py-15">
        <div className="container mx-auto">
           <Reveal className="text-center mb-16">
            <p className="text-ui-sky font-bold text-[14px] uppercase tracking-[2px] mb-2">PLANS</p>
            <h2 className="text-[36px] md:text-[40px] font-bold text-ui-text-main mb-2 tracking-tight">Membership Plans</h2>
            <p className="text-ui-text-muted text-[17px] max-w-2xl mx-auto leading-relaxed">Choose the plan that fits your project. Upgrade or downgrade at any time.</p>
          </Reveal>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Basic Card */}
            <Reveal className="p-8 rounded-[24px] border border-ui-border-blue/60 bg-ui-white shadow-xl shadow-sky-100/40 flex flex-col transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <div className="mb-6 text-left">
                <h3 className="text-[20px] font-bold text-ui-text-main mb-1">Basic</h3>
                <div className="text-[42px] font-bold text-ui-text-main mb-1 tracking-tighter">$29 <span className="text-[15px] text-ui-text-muted font-normal tracking-normal border-none italic-none">/mo</span></div>
                <p className="text-ui-text-muted text-[14px] italic leading-relaxed">Perfect for developers building their first plugin.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow text-left">
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-ui-blue"></div> Layout 1 Access</li>
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-ui-blue"></div> 1 Active Domain</li>
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-ui-blue"></div> API Access</li>
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-ui-blue"></div> Email Support</li>
              </ul>
              <Button asChild variant="outline" className="w-full rounded-full h-12 border-ui-border-blue text-ui-blue font-bold text-[15px] hover:bg-ui-bg-blue shadow-sm transition-all active:scale-95">
                <Link href="/signup">Get Started</Link>
              </Button>
            </Reveal>

            {/* Pro Card */}
            <Reveal className="p-8 rounded-[24px] border-[3px] border-ui-blue bg-ui-white shadow-2xl shadow-indigo-100/60 relative overflow-hidden flex flex-col ring-8 ring-indigo-50/50 transform lg:scale-[1.05] z-10 transition-all duration-500 hover:shadow-indigo-200/50">
              <div className="absolute top-0 right-0 left-0 h-9 gradient-primary flex items-center justify-center">
                 <span className="text-ui-white text-[11px] font-bold uppercase tracking-[2px]">Most Popular</span>
              </div>
              <div className="mt-8 mb-6 text-left">
                <h3 className="text-[20px] font-bold text-ui-text-main mb-1">Pro</h3>
                <div className="text-[42px] font-bold text-ui-text-main mb-1 tracking-tighter">$79 <span className="text-[15px] text-ui-text-muted font-normal tracking-normal italic-none">/mo</span></div>
                <p className="text-ui-text-muted text-[14px] italic leading-relaxed">Ideal for freelancers and small agencies.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow text-left">
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><CheckCircle2 className="w-4 h-4 text-ui-blue shrink-0" /> Layout 1-3 Access</li>
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><CheckCircle2 className="w-4 h-4 text-ui-blue shrink-0" /> 10 Active Domains</li>
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><CheckCircle2 className="w-4 h-4 text-ui-blue shrink-0" /> Priority API Access</li>
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><CheckCircle2 className="w-4 h-4 text-ui-blue shrink-0" /> Priority Support</li>
              </ul>
              <Button asChild className="w-full rounded-full h-12 gradient-primary text-ui-white font-bold text-[15px] shadow-xl shadow-ui-blue/30 transition-all hover:scale-[1.02] active:scale-95">
                <Link href="/signup">Get Started</Link>
              </Button>
            </Reveal>

            {/* Enterprise Card */}
            <Reveal className="p-8 rounded-[24px] border border-ui-border-blue/60 bg-ui-white shadow-xl shadow-sky-100/40 flex flex-col transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
              <div className="mb-6 text-left">
                <h3 className="text-[20px] font-bold text-ui-text-main mb-1">Enterprise</h3>
                <div className="text-[42px] font-bold text-ui-text-main mb-1 tracking-tighter">$199 <span className="text-[15px] text-ui-text-muted font-normal tracking-normal italic-none">/mo</span></div>
                <p className="text-ui-text-muted text-[14px] italic leading-relaxed">Built for agencies and large teams.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow text-left">
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-ui-blue"></div> Full Layout (1-4)</li>
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-ui-blue"></div> Unlimited Domains</li>
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-ui-blue"></div> Dedicated Manager</li>
                 <li className="flex items-center gap-3 text-[14px] text-ui-text-main font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-ui-blue"></div> White Label Option</li>
              </ul>
              <Button asChild variant="outline" className="w-full rounded-full h-12 border-ui-border-blue text-ui-blue font-bold text-[15px] hover:bg-ui-bg-blue shadow-sm transition-all active:scale-95">
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-15 bg-ui-white px-6">
        <div className="container mx-auto px-6 max-w-4xl">
           <Reveal className="text-center mb-12">
            <p className="text-ui-sky font-bold text-[14px] uppercase tracking-[2px] mb-3">FAQ</p>
            <h2 className="text-[36px] md:text-[40px] font-bold text-ui-text-main mb-3 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-ui-text-muted text-[17px] max-w-2xl mx-auto  font-medium">Have questions? We have answers.</p>
          </Reveal>
          
          <div className="space-y-4">
            {[
              { q: "Can I switch layouts after purchasing?", a: "Yes, you can switch between any layouts included in your plan at any time from your dashboard. Changes go live instantly." },
              { q: "How does domain locking work?", a: "Each license key is tied to one or more domains depending on your plan. If someone tries to use your key on an unauthorized domain, it will be rejected by our API." },
              { q: "Do purchased layouts require a subscription?", a: "One-time layout purchases from the shop include lifetime access to that layout. A subscription is only needed for ongoing license management and API calls." },
              { q: "Is there a free trial?", a: "Yes, all plans include a 14-day free trial with no credit card required. You'll have full access to test all features." }
            ].map((item, i) => (
              <Reveal key={i} className={cn("delay-[", i * 100, "ms]")}>
                <div className={cn(
                  "rounded-[16px] border border-ui-border-blue/80 overflow-hidden shadow-sm transition-all duration-300",
                  openFaq === i ? "bg-ui-bg-blue/50 border-ui-blue/30 scale-[1.01]" : "bg-ui-white"
                )}>
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between group outline-none"
                  >
                    <span className={cn(
                      "text-[17px] font-bold leading-tight tracking-tight transition-colors",
                      openFaq === i ? "text-ui-blue" : "text-ui-text-main"
                    )}>
                      {item.q}
                    </span>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                      openFaq === i ? "bg-ui-blue text-ui-white rotate-180 shadow-md" : "bg-ui-bg-sky-soft text-ui-sky"
                    )}>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </div>
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-400 ease-in-out",
                    openFaq === i ? "max-h-[250px] opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="px-8 pb-8 text-ui-text-muted text-[16px] border-t border-ui-border-blue/30 pt-6 leading-relaxed font-medium">
                      {item.a}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Global CTA */}
      <section className="py-20 bg-ui-bg-blue px-6 antialiased">
        <Reveal className="container mx-auto max-w-6xl rounded-[48px] gradient-primary py-28 px-12 text-center relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(54,80,165,0.4)] transition-transform hover:scale-[1.01] duration-700">
           <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full bg-ui-white/10 blur-[100px] animate-pulse"></div>
           <div className="absolute bottom-[-80px] left-[-80px] w-96 h-96 rounded-full bg-black/5 blur-[100px] animate-pulse"></div>
           
           <div className="relative z-10">
              <h2 className="text-[42px] md:text-[40px] font-bold text-ui-white mb-10 tracking-tight leading-[1.1] max-w-4xl mx-auto">Start Building Better WordPress Sites Today</h2>
              <p className="text-ui-white/90 text-[20px] mb-14 max-w-3xl mx-auto font-medium leading-relaxed italic-none">
                Join 12,000+ developers who trust Solution22 for their plugin license <br className="hidden md:block" /> and layout management.
              </p>
              <Button asChild size="lg" className="bg-ui-white hover:bg-ui-bg-blue text-ui-blue font-bold rounded-full px-16 h-13 text-[20px] shadow-2xl transition-all transform hover:scale-105 active:scale-95 group">
                <Link href="/signup" className="flex items-center gap-2">Get Started Free <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
           </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-ui-text-main pt-10 pb-8 text-ui-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ui-blue via-ui-cyan to-ui-blue opacity-20"></div>
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-16 mb-6">
            <Reveal className="col-span-1 md:col-span-1">
              <Link href="/" className="inline-block mb-10 transform hover:scale-105 transition-transform">
                <Image 
                  src="/s22_logo.svg" 
                  alt="Solution22 Logo" 
                  width={140} 
                  height={50} 
                  className="object-contain"
                />
              </Link>
              <p className="text-ui-white/50 text-[15px] leading-relaxed max-w-[260px] italic font-medium">
                The all-in-one platform for WordPress plugin license management and premium layout delivery.
              </p>
            </Reveal>
            <Reveal className="delay-100">
              <h4 className="text-[17px] font-bold mb-8 tracking-tight uppercase tracking-[1px] text-ui-white/90">Product</h4>
              <ul className="space-y-5 text-ui-white/50 text-[15px] font-medium">
                <li><a href="#" className="hover:text-ui-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-ui-white transition-colors">Layouts</a></li>
                <li><a href="#" className="hover:text-ui-white transition-colors">Shop</a></li>
                <li><a href="#" className="hover:text-ui-white transition-colors">Pricing</a></li>
              </ul>
            </Reveal>
            <Reveal className="delay-200">
              <h4 className="text-[17px] font-bold mb-8 tracking-tight uppercase tracking-[1px] text-ui-white/90">Developers</h4>
              <ul className="space-y-4 text-ui-white/50 text-[15px] font-medium">
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </Reveal>
            <Reveal className="delay-300">
              <h4 className="text-[17px] font-bold mb-8 tracking-tight uppercase tracking-[1px] text-ui-white/90">Company</h4>
              <ul className="space-y-4 text-ui-white/50 text-[15px] font-medium">
                <li><a href="#" className="hover:text-ui-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-ui-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-ui-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-ui-white transition-colors">Contact</a></li>
              </ul>
            </Reveal>
          </div>
          
          <Reveal className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-ui-white/30 text-[14px] font-medium">
            <p>© 2026 Solution22. All rights reserved.</p>
            <div className="flex gap-10">
              <a href="#" className="hover:text-ui-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-ui-white transition-colors">Terms</a>
              <a href="#" className="hover:text-ui-white transition-colors">Cookies</a>
            </div>
          </Reveal>
        </div>
      </footer>
    </div>
  );
}
