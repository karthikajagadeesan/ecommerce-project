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
  ChevronUp,
  Menu
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
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
import CustomButton from "@/components/customButton";

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    // Initial session check
    const checkState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkState();

    // Subscribe to auth changes (sign in, sign up, sign out, user deleted)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // USER_DELETED fires when admin deletes the user from Supabase dashboard
      // We cast to any to handle potential custom or newer events without TS errors
      if ((event as any) === 'USER_DELETED' || event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(!!session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persistence for FAQ state
  useEffect(() => {
    const saved = localStorage.getItem('openFaq');
    if (saved !== null) {
      setOpenFaq(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    if (openFaq !== null) {
      localStorage.setItem('openFaq', openFaq.toString());
    } else {
      localStorage.removeItem('openFaq');
    }
  }, [openFaq]);

  return (
    <div className="flex flex-col bg-background text-ui-text-main font-sans selection:bg-ui-bg-blue-soft antialiased scroll-smooth overflow-x-hidden relative">
      {/* Navigation */}
      <header className={cn(
        "sticky top-0 w-full bg-ui-white z-50 border-b border-ui-border-blue transition-all duration-500 ease-in-out",
        isMenuOpen ? "shadow-lg" : ""
      )}>
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
            <div className="hidden md:block">
              {isLoggedIn === null ? (
                <div className="w-28 h-12 bg-ui-border-blue/20 rounded-full animate-pulse" />
              ) : (
                <Button asChild size="lg" className="gradient-primary rounded-full px-8 font-medium">
                  <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                    {isLoggedIn ? "Login" : "Sign Up"}
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-ui-text-main transition-transform active:scale-90"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-6 h-6">
                <Menu className={cn(
                  "absolute inset-0 h-6 w-6 transition-all duration-500",
                  isMenuOpen ? "rotate-45 opacity-0 scale-0" : "rotate-0 opacity-100 scale-100"
                )} />
                <Plus className={cn(
                  "absolute inset-0 h-6 w-6 transition-all duration-500",
                  isMenuOpen ? "rotate-135 opacity-100 scale-100" : "rotate-45 opacity-0 scale-0"
                )} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu (Push Content Down) */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-ui-white",
          isMenuOpen ? "max-h-[500px] border-t border-ui-border-blue/30 opacity-100 pb-10" : "max-h-0 opacity-0"
        )}>
          <div className="flex flex-col px-8 py-8 space-y-6">
            <nav className="flex flex-col space-y-6 text-[18px] font-medium text-ui-text-muted">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="hover:text-ui-blue transition-colors">Features</a>
              <a href="#layouts" onClick={() => setIsMenuOpen(false)} className="hover:text-ui-blue transition-colors">Layouts</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="hover:text-ui-blue transition-colors">Pricing</a>
              <a href="#faq" onClick={() => setIsMenuOpen(false)} className="hover:text-ui-blue transition-colors">FAQ</a>
            </nav>
            <div className="pt-4">
               <Button asChild size="lg" className="w-full gradient-primary rounded-xl h-14 font-bold text-[16px] shadow-lg shadow-ui-blue/20">
                <Link href={isLoggedIn ? "/dashboard" : "/signup"} onClick={() => setIsMenuOpen(false)}>
                  {isLoggedIn ? "Login" : "Sign Up"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="md:pt-20 pt-15 pb-10 bg-ui-bg-blue relative overflow-hidden">
        <Reveal className="container mx-auto px-6 text-center relative z-10 transition-delay-0">
          <div className="inline-flex items-center gap-2 px-2 py-1.5 rounded-full border border-ui-border-blue text-ui-badge-text text-[14px] font-medium mb-8 shadow-sm">
            <div  />
            <span className="bg-text-ui-blue text-sm">✦</span>
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
            <CustomButton
              text="Get Started Now"
              iconColor="text-white"
              iconBgColor="gradient-primary group-hover:bg-gray-800"
              buttonBgColor="bg-ui-badge-bg"
              textColor="text-black"
              borderColor="border border-ui-border-shade"
              onClick="/signup"
            />
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
          <Reveal className="max-w-4xl mx-auto text-center mb-16 relative z-10">
            <div className="flex items-center justify-center mb-2 gap-2">
              <span className="text-ui-blue text-base sm:text-lg">✦</span>
              <p className="text-xs sm:text-sm font-bold tracking-[3px] uppercase text-ui-text-main/80">
                Our Features
              </p>
            </div>
            <h2 className="text-[38px] md:text-[40px]  text-ui-text-main mb-6 tracking-tight leading-[1.1]">
              Everything You Need <br className="sm:hidden" /><span className="text-transparent bg-clip-text gradient-primary">To Scale</span>
            </h2>
            <p className="text-base sm:text-[17px] text-ui-text-muted leading-relaxed max-w-2xl mx-auto px-2 font-medium">
              The most robust license and layout management delivery system built to ensure high-performance WordPress solutions.
            </p>
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
          <Reveal className="max-w-4xl mx-auto text-center mb-12 relative z-10">
            <div className="flex items-center justify-center gap-2">
              <span className="text-ui-blue text-base sm:text-lg">✦</span>
              <p className="text-xs sm:text-sm font-bold tracking-[3px] uppercase text-ui-text-main/80">
                LIVE PREVIEW
              </p>
            </div>
            <h2 className="text-[38px] md:text-[40px]  text-ui-text-main mb-6 tracking-tight leading-[1.1]">
              4 Powerful Layouts, <br className="sm:hidden" /><span className="text-transparent bg-clip-text gradient-primary">Live Showcase</span>
            </h2>
            <p className="text-base sm:text-[17px] text-ui-text-muted leading-relaxed max-w-2xl mx-auto px-2 font-medium">
              Switch between all four layouts and see exactly how your plugin content will look on any WordPress site.
            </p>
          </Reveal>

          {/* Layout Tabs - Scrollable on mobile, Fixed on Laptop */}
          <Reveal className="w-full mb-12">
            <div className="flex justify-start md:justify-center items-center gap-3 md:gap-4 overflow-x-auto md:overflow-x-hidden px-6 md:px-0 pb-4 md:pb-0 scrollbar-thin scrollbar-thumb-ui-blue">
                {[1, 2, 3, 4].map((l) => (
                <button
                    key={l}
                    onClick={() => setActiveLayout(l)}
                    className={cn(
                    "px-6 md:px-8 py-2 md:py-2.5 rounded-full font-bold text-[14px] md:text-[15px]  shrink-0",
                    activeLayout === l
                        ? "gradient-primary text-ui-white"
                        : "bg-ui-white text-ui-text-muted border border-ui-border-blue hover:border-ui-blue/40 hover:text-ui-blue"
                    )}
                >
                    Layout {l}
                </button>
                ))}
            </div>
          </Reveal>

          {/* Layout Card */}
          <Reveal className="max-w-7xl mx-auto rounded-2xl bg-ui-white/50 backdrop-blur-sm  overflow-hidden border border-ui-border-blue shadow-lg">
            <div className=" transition-all duration-700 ease-in-out">
               <LayoutManager entries={DUMMY_ENTRIES} layout={activeLayout} />
            </div>
          </Reveal>
        </div>
      </section>

    

      {/* Membership Plans */}
      <section id="pricing" className="py-15">
        <div className="container mx-auto px-6">
           <Reveal className="max-w-4xl mx-auto text-center mb-16 relative z-10">
            <div className="flex items-center justify-center gap-2">
              <span className="text-ui-blue text-base sm:text-lg">✦</span>
              <p className="text-xs sm:text-sm font-bold tracking-[3px] uppercase text-ui-text-main/80">
                OUR PLANS
              </p>
            </div>
            <h2 className="text-[38px] md:text-[40px] text-ui-text-main mb-5 tracking-tight leading-[1.1]">
              Membership <br className="sm:hidden" /><span className="text-transparent bg-clip-text gradient-primary">Options</span>
            </h2>
            <p className="text-base sm:text-[17px] text-ui-text-muted leading-relaxed max-w-2xl mx-auto px-2 font-medium">
              Choose the plan that fits your project. Upgrade or downgrade at any time as your business grows.
            </p>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Basic Card */}
            <Reveal className="flex flex-col h-full">
                <div className="p-8 h-full rounded-[24px] border border-ui-border-blue/60 bg-ui-white shadow-xl shadow-sky-100/40 flex flex-col transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
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
                    <Button asChild variant="outline" className="w-full rounded-full h-12 border-ui-border-blue text-ui-blue font-bold text-[15px] hover:bg-ui-bg-blue shadow-sm transition-all active:scale-95 mt-auto">
                        <Link href="/signup">Upgrade Now</Link>
                    </Button>
                </div>
            </Reveal>

            {/* Pro Card */}
            <Reveal className="flex flex-col h-full">
                <div className="p-8 h-full rounded-[24px] border-[3px] border-ui-blue bg-ui-white shadow-2xl shadow-indigo-100/60 relative overflow-hidden flex flex-col ring-8 ring-indigo-50/50 transform lg:scale-[1.05] z-10 transition-all duration-500 hover:shadow-indigo-200/50">
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
                    <Button asChild className="w-full rounded-full h-12 gradient-primary text-ui-white font-bold text-[15px] shadow-xl shadow-ui-blue/30 transition-all hover:scale-[1.02] active:scale-95 mt-auto">
                        <Link href="/signup">Upgrade Now</Link>
                    </Button>
                </div>
            </Reveal>

            {/* Enterprise Card */}
            <Reveal className="flex flex-col h-full">
                <div className="p-8 h-full rounded-[24px] border border-ui-border-blue/60 bg-ui-white shadow-xl shadow-sky-100/40 flex flex-col transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
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
                    <Button asChild variant="outline" className="w-full rounded-full h-12 border-ui-border-blue text-ui-blue font-bold text-[15px] hover:bg-ui-bg-blue shadow-sm transition-all active:scale-95 mt-auto">
                        <Link href="/signup">Upgrade Now</Link>
                    </Button>
                </div>
            </Reveal>
          </div>
        </div>
      </section>

        {/* Process Section */}
      <section className="py-15 bg-ui-bg-blue">
        <div className="container mx-auto px-6 text-center">
          <Reveal className="max-w-4xl mx-auto text-center mb-24 relative z-10">
            <div className="flex items-center justify-center  gap-2">
              <span className="text-ui-blue text-base sm:text-lg">✦</span>
              <p className="text-xs sm:text-sm font-bold tracking-[3px] uppercase text-ui-text-main/80">
                EASY PROCESS
              </p>
            </div>
            <h2 className="text-[38px] md:text-[40px]  text-ui-text-main mb-6 tracking-tight leading-[1.1]">
              How it works, <br className="sm:hidden" /><span className="text-transparent bg-clip-text gradient-primary">Made Simple</span>
            </h2>
            <p className="text-base sm:text-[17px] text-ui-text-muted leading-relaxed max-w-2xl mx-auto px-2 font-medium">
              Start your application journey with a simple process that anyone can navigate in minutes.
            </p>
          </Reveal>
          
          <div className="grid md:grid-cols-4 gap-12 relative max-w-6xl mx-auto">
             <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] border-t-2 border-dashed border-sky-300 opacity-40"></div>
            {[
              { step: "1", title: "Choose a Layout", desc: "Browse our collection of high performance layouts." },
              { step: "2", title: "Connect Domain", desc: "Enter your domain to lock the license for security." },
              { step: "3", title: "Purchase a License", desc: "Select the plan that fits your project needs." },
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

       {/* Global CTA */}
      <section className="relative py-10 px-6 antialiased overflow-hidden h-[450px] flex items-center justify-center">
        {/* Background GIF */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/Solution.gif" 
            alt="Background" 
            fill 
            className="object-cover" 
            unoptimized 
          />
          {/* Subtle dark overlay to ensure readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <Reveal className="container mx-auto max-w-4xl py-16 md:py-28 px-6 md:px-12 text-center relative z-10 transition-transform hover:scale-[1.01] duration-700">
           <div className="relative z-10">
              <h2 className="text-[28px] md:text-[35px] font-semibold text-ui-white mb-2 tracking-tight leading-[1.1] max-w-4xl mx-auto">Start Building Better WordPress Sites Today</h2>
              <p className="text-ui-white/90 text-[15px] md:text-[18px] mb-6 max-w-3xl mx-auto font-medium leading-relaxed italic-none">
                Join 12,000+ developers who trust Solution22 for their plugin license <br className="hidden md:block" /> and layout management.
              </p>
             <CustomButton
               text="Get Started"
              iconColor="text-white"
              iconBgColor="bg-black group-hover:bg-gray-800"
              buttonBgColor="bg-white"
              textColor="text-black"
              onClick="/signup"
            />
           </div>
        </Reveal>
      </section>


      {/* FAQ Section */}
      <section id="faq" className="py-18 bg-ui-bg-blue px-6">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col lg:flex-row gap-16 items-start">
          <div className="lg:w-5/11 sticky ">
            <Reveal className="text-left">
              <div className="flex items-center justify-start gap-2">
                <span className="text-ui-blue text-base sm:text-lg">✦</span>
                <p className="text-xs sm:text-sm font-bold tracking-[3px] uppercase text-ui-text-main/80">
                  FAQ&apos;S
                </p>
              </div>
              <h2 className="text-[38px] md:text-[40px]  text-ui-text-main mb-6 tracking-tight leading-[1.1]">
                Frequently asked <br className="sm:hidden" /><span className="text-transparent bg-clip-text gradient-primary">Questions</span>
              </h2>
              <p className="text-base sm:text-[15px]  leading-relaxed max-w-md px-0 opacity-90">
                Find answers to common queries about our layout solutions and services in a clear and concise format.
              </p>
            </Reveal>
          </div>
          
          {/* Right Column: Accordion */}
          <div className="lg:w-6/11 w-full space-y-4">
            {[
              { q: "Can I switch layouts after purchasing?", a: "Yes, you can switch between any layouts included in your plan at any time from your dashboard. Changes go live instantly." },
              { q: "How does domain locking work?", a: "Each license key is tied to one or more domains depending on your plan. If someone tries to use your key on an unauthorized domain, it will be rejected by our API." },
              { q: "Do purchased layouts require a subscription?", a: "One-time layout purchases from the shop include lifetime access to that layout. A subscription is only needed for ongoing license management and API calls." },
              { q: "Is there a free trial?", a: "Yes, all plans include a 14-day free trial with no credit card required. You'll have full access to test all features." }
            ].map((item, i) => (
              <Reveal key={i} className={cn("delay-[", i * 100, "ms] w-full")}>
                <div className={cn(
                  "rounded-[12px] border border-ui-border-blue/50 overflow-hidden shadow-sm transition-all duration-400 group",
                  openFaq === i ? "bg-ui-white shadow-md ring-1 ring-ui-blue/5 scale-[1.01]" : "bg-ui-white/80 hover:bg-ui-white"
                )}>
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between group outline-none"
                  >
                    <span className={cn(
                      "text-[16px] font-bold leading-tight tracking-tight transition-colors",
                      openFaq === i ? "text-ui-blue" : "text-ui-text-main group-hover:text-ui-blue"
                    )}>
                      {item.q}
                    </span>
                    <div className={cn(
                      "transition-all duration-300",
                      openFaq === i ? "rotate-180 text-ui-blue" : "text-ui-text-muted"
                    )}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    openFaq === i ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="px-8 pb-8 text-ui-text-muted text-[15px] border-t border-ui-border-blue/20 leading-relaxed font-medium">
                      {item.a}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

     
      {/* Footer */}
      <footer className="bg-ui-footer-bg pt-10 pb-8 text-ui-white overflow-hidden relative">
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
