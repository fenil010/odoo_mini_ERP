"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Hammer,
  FileText,
  Users,
  Shield,
  Activity,
  ArrowRight,
  ChevronRight,
  Sparkles,
  ChevronDown,
  Star,
  Check,
  Plus,
  Play,
  CheckCircle,
  Truck,
  Layers,
  Award,
  Clock,
  Eye,
  Lock
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("all");
  
  // Interactive mockup states
  const [salesStep, setSalesStep] = useState(1);
  const [analyticsMetric, setAnalyticsMetric] = useState<"sales" | "production">("sales");
  const [auditLogs, setAuditLogs] = useState([
    { time: "14:32", user: "Admin", action: "updated stock of", target: "Metal Legs", diff: "+50", type: "success" },
    { time: "11:15", user: "Sales", action: "confirmed Sales Order", target: "SO-1024", diff: "", type: "info" }
  ]);
  
  // Simulation for live audit logs ticking
  React.useEffect(() => {
    const events = [
      { time: "15:02", user: "System", action: "auto-created Mfg Order", target: "MO-001", diff: "", type: "system" },
      { time: "15:05", user: "Purchase", action: "sent Purchase Order", target: "PO-0943", diff: "", type: "warning" },
      { time: "15:10", user: "Inventory", action: "received raw stock of", target: "Oak Panels", diff: "+15", type: "success" },
      { time: "15:12", user: "System", action: "completed Work Order", target: "WO-切割", diff: "", type: "system" }
    ];
    
    let counter = 0;
    const interval = setInterval(() => {
      setAuditLogs((prev) => {
        const nextEvent = events[counter % events.length];
        const newEvent = { ...nextEvent, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
        counter++;
        return [newEvent, prev[0]]; // Keep latest 2 items
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Custom Intersection Observer for scroll reveal animations
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const revealElements = document.querySelectorAll(".reveal-on-scroll");
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#f7f4ed] text-[#1d2520] font-sans overflow-x-hidden selection:bg-[#176b5d]/20 selection:text-[#176b5d]">
      
      {/* Decorative Corner Glow Flares (Teal Left, Amber Right) matching the layout of the reference screenshot */}
      <div className="absolute top-0 left-0 w-[35%] h-[550px] bg-gradient-to-br from-[#176b5d]/18 via-[#eef7f3]/6 to-transparent blur-3xl rounded-br-[120px] pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[35%] h-[550px] bg-gradient-to-bl from-[#ffe1a6]/35 via-[#f7f4ed]/0 to-transparent blur-3xl rounded-bl-[120px] pointer-events-none z-0" />
      
      {/* Ambient background animations */}
      <div className="absolute top-[20%] left-[-10%] w-[40%] aspect-square rounded-full bg-radial from-[#176b5d]/5 to-transparent blur-3xl pointer-events-none z-0 animate-aurora-1" />
      <div className="absolute top-[15%] right-[-10%] w-[40%] aspect-square rounded-full bg-radial from-[#ffe1a6]/10 to-transparent blur-3xl pointer-events-none z-0 animate-aurora-2" />
      <div className="absolute bottom-[10%] left-[-5%] w-[40%] aspect-square rounded-full bg-radial from-[#ffe1a6]/15 via-[#f7f4ed]/0 to-transparent blur-3xl pointer-events-none z-0 animate-aurora-2" />

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#e3d8c5]/40 bg-[#f7f4ed]/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Mini ERP home">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#176b5d] text-base font-bold text-white shadow-md shadow-[#176b5d]/10 transition-transform duration-300 group-hover:scale-105">
              ERP
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#1d2520] leading-none tracking-tight">Mini ERP</span>
              <span className="text-[10px] text-[#53645c] mt-1 font-medium tracking-wide uppercase">Demand to Delivery</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#53645c]">
            <a href="#features" className="relative py-2 transition-colors hover:text-[#176b5d] group">
              Features
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#176b5d] transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#modules" className="relative py-2 transition-colors hover:text-[#176b5d] group">
              Modules
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#176b5d] transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#pricing" className="relative py-2 transition-colors hover:text-[#176b5d] group">
              Pricing
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#176b5d] transition-all duration-300 group-hover:w-full" />
            </a>
            <div className="relative py-2 transition-colors hover:text-[#176b5d] group flex items-center gap-1 cursor-pointer">
              Pages
              <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
            </div>
          </nav>

          {/* Right Header Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#53645c] transition hover:bg-white/70 hover:text-[#176b5d]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="group flex items-center gap-1.5 rounded-xl bg-[#176b5d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#176b5d]/10 transition-all hover:bg-[#12574b] hover:shadow-md hover:shadow-[#176b5d]/20 active:scale-98"
            >
              Get Started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-7xl px-6 pt-12 pb-12 sm:px-8 lg:pt-16 lg:pb-20 z-10">
          
          {/* Main Hero Container with flexbox positioning to guarantee no overlap */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 xl:gap-8 w-full min-h-[460px] lg:min-h-[500px] xl:min-h-[540px]">
            
            {/* Left Column: Floating Stat Card (Desktop only) */}
            <div className="hidden lg:block w-[270px] xl:w-[290px] shrink-0 space-y-6 z-20">
              
              {/* Total Orders Card */}
              <div className="animate-float-slow rounded-2xl border border-[#e3d8c5]/75 bg-white/95 p-6 shadow-xl shadow-[#cfc3ad]/15 backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#53645c] tracking-wide uppercase">Total Orders</span>
                  <div className="flex items-center gap-1 rounded-full bg-[#eef7f3] px-2 py-0.5 text-[10px] font-bold text-[#176b5d] border border-[#176b5d]/10">
                    <TrendingUp className="size-3" />
                    +18.6%
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-3xl font-extrabold text-[#1d2520] tracking-tight">1,250+</h3>
                  <p className="text-[11px] text-[#6a766f] font-medium mt-0.5">This Month</p>
                </div>
                
                {/* Micro SVG line graph with draw animation */}
                <div className="mt-6 h-14 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#176b5d" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#176b5d" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Fill */}
                    <path
                      d="M0,30 L0,18 C15,22 25,5 45,15 C60,5 75,25 100,5 L100,30 Z"
                      fill="url(#chartGlow)"
                    />
                    {/* Line */}
                    <path
                      d="M0,18 C15,22 25,5 45,15 C60,5 75,25 100,5"
                      fill="none"
                      stroke="#176b5d"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="200"
                      strokeDashoffset="200"
                      className="animate-draw"
                      style={{ animation: "draw 2s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.5s" }}
                    />
                    {/* Pulsing endpoint */}
                    <circle cx="100" cy="5" r="3" fill="#176b5d" className="animate-pulse" />
                  </svg>
                </div>
                <p className="text-[11px] text-[#6a766f] mt-3 font-medium text-center border-t border-[#e3d8c5]/40 pt-3">
                  +18.6% vs last month
                </p>
              </div>

              {/* Extra visual anchor to balance left side */}
              <div className="p-4 rounded-xl bg-[#eef7f3]/50 border border-[#176b5d]/10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#176b5d] text-white">
                  <Layers className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1d2520]">Modular Pipeline</h4>
                  <p className="text-[10px] text-[#53645c] mt-0.5">Automated material routing</p>
                </div>
              </div>

            </div>

            {/* Center Content: Main Text & CTAs */}
            <div className="text-center flex-1 max-w-2xl xl:max-w-3xl mx-auto z-10 px-4">
              
              {/* Announcement badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#e3d8c5] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#53645c] shadow-xs mb-8 hover:scale-102 transition-all">
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/50">New</span>
                <Sparkles className="size-3.5 text-amber-500 fill-amber-500/10" />
                <span>Complete ERP for Manufacturing</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight text-[#1d2520] sm:text-5xl lg:text-[42px] xl:text-[48px] 2xl:text-[54px] lg:leading-[1.15] xl:leading-[1.12] max-w-3xl mx-auto">
                From Customer Demand <br className="hidden sm:inline" />
                to Product Delivery – <br className="hidden sm:inline" />
                One Intelligent ERP Platform.
              </h1>

              {/* Subheading (restored) */}
              <p className="mt-7 text-sm sm:text-base md:text-[17px] leading-relaxed text-[#53645c] max-w-2xl mx-auto">
                Manage Sales, Inventory, Manufacturing, Procurement and Delivery <br className="hidden md:inline" />
                from a single connected system built for modern manufacturing businesses.
              </p>

              {/* Bullet indicators (restored) */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-semibold text-[#53645c]">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <span className="text-[#1d2520]">Real-time Visibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <span className="text-[#1d2520]">End-to-End Automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <span className="text-[#1d2520]">Inventory-Centric</span>
                </div>
              </div>

              {/* Action Buttons (side by side and nicely styled) */}
              <div className="mt-10 flex flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-13 items-center justify-center gap-1.5 rounded-xl bg-black hover:bg-black/90 text-white px-7 text-sm font-bold shadow-md transition duration-200 active:scale-98"
                >
                  <span>Start Free Demo</span>
                  <ChevronRight className="size-4" />
                </Link>
                <a
                  href="#modules"
                  className="inline-flex h-13 items-center justify-center gap-1.5 rounded-xl border border-[#e3d8c5] bg-white text-[#1d2520] hover:bg-[#fffaf2] px-7 text-sm font-bold shadow-sm transition duration-200 active:scale-98"
                >
                  <span>Explore Workflow</span>
                  <ChevronRight className="size-4" />
                </a>
              </div>

            </div>

            {/* Right Column: Floating Stat Cards (Desktop only) */}
            <div className="hidden lg:block w-[270px] xl:w-[290px] shrink-0 space-y-6 z-20">
              
              {/* Manufacturing Orders Card */}
              <div className="animate-float-delayed rounded-2xl border border-[#e3d8c5]/75 bg-white/95 p-5 shadow-xl shadow-[#cfc3ad]/15 backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#53645c] tracking-wide uppercase">Manufacturing Orders</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
                    In Progress
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-3xl font-extrabold text-[#1d2520] tracking-tight">320+</h3>
                </div>
                <p className="text-[11px] text-[#6a766f] mt-3 font-medium text-center border-t border-[#e3d8c5]/40 pt-3 flex items-center justify-between">
                  <span>+24.1% vs last month</span>
                  <span className="text-[#176b5d] font-bold">+24.1%</span>
                </p>
              </div>

              {/* Inventory Value Card */}
              <div className="animate-float-slow delay-200 rounded-2xl border border-[#e3d8c5]/75 bg-white/95 p-5 shadow-xl shadow-[#cfc3ad]/15 backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#53645c] tracking-wide uppercase">Inventory Value</span>
                  <span className="text-[10px] font-bold text-[#176b5d] bg-[#eef7f3] px-2 py-0.5 rounded-full border border-[#176b5d]/10">
                    Current
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-3xl font-extrabold text-[#1d2520] tracking-tight">$2.45M</h3>
                </div>
                <p className="text-[11px] text-[#6a766f] mt-3 font-medium text-center border-t border-[#e3d8c5]/40 pt-3 flex items-center justify-between">
                  <span>+15.8% vs last month</span>
                  <span className="text-[#176b5d] font-bold">+15.8%</span>
                </p>
              </div>

            </div>

          </div>

          {/* Responsive Layout for Stat Cards on Mobile/Tablet */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:hidden">
            {/* Card 1 */}
            <div className="rounded-2xl border border-[#e3d8c5]/70 bg-white/95 p-5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#53645c] uppercase">Total Orders</span>
                <span className="text-[10px] font-bold text-[#176b5d] bg-[#eef7f3] px-2 py-0.5 rounded-full border border-[#176b5d]/10">+18.6%</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">1,250+</h3>
              <p className="text-xs text-[#6a766f] mt-1">This Month</p>
            </div>
            {/* Card 2 */}
            <div className="rounded-2xl border border-[#e3d8c5]/70 bg-white/95 p-5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#53645c] uppercase">Manufacturing Orders</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">In Progress</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">320+</h3>
              <p className="text-xs text-[#6a766f] mt-1">+24.1% vs last month</p>
            </div>
            {/* Card 3 */}
            <div className="rounded-2xl border border-[#e3d8c5]/70 bg-white/95 p-5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#53645c] uppercase">Inventory Value</span>
                <span className="text-[10px] font-bold text-[#176b5d] bg-[#eef7f3] px-2 py-0.5 rounded-full border border-[#176b5d]/10">Current</span>
              </div>
              <h3 className="text-2xl font-bold mt-2">$2.45M</h3>
              <p className="text-xs text-[#6a766f] mt-1">+15.8% vs last month</p>
            </div>
          </div>

          {/* Trusted by Manufacturing Businesses (Full width below the columns, above core modules) */}
          <div className="reveal-on-scroll mt-16 pt-10 border-t border-[#e3d8c5]/40 text-center max-w-4xl mx-auto w-full z-20">
            <p className="text-xs font-bold tracking-widest text-[#53645c] uppercase">
              Trusted by Manufacturing Businesses
            </p>
            <p className="text-sm font-bold text-[#6a766f] mt-1.5">
              Join 4,000+ companies already growing with Mini ERP
            </p>
            
            {/* Logo list marquee with larger names and wider gaps */}
            <div className="relative mt-8 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
              <div className="flex w-[200%] items-center gap-20 animate-marquee py-2 text-sm font-black tracking-widest text-[#1d2520]/50">
                {/* Set 1 */}
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">STEELFORGE</span>
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">APEX ASSEMBLY</span>
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">VELOPARTS</span>
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">PRECISION AUTO</span>
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">LOGI-TECH</span>
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">OMNIFAB</span>
                {/* Set 2 */}
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">STEELFORGE</span>
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">APEX ASSEMBLY</span>
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">VELOPARTS</span>
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">PRECISION AUTO</span>
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">LOGI-TECH</span>
                <span className="hover:text-[#176b5d] transition-colors duration-200 cursor-default">OMNIFAB</span>
              </div>
            </div>
          </div>

        </section>


        {/* Modules Section */}
        <section id="modules" className="mx-auto max-w-7xl px-6 pt-16 pb-20 sm:px-8 lg:pt-20 lg:pb-28 relative">
          
          {/* Section Header */}
          <div className="reveal-on-scroll text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 uppercase tracking-wide">
              Core Modules
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-[#1d2520] sm:text-4xl lg:text-5xl tracking-tight">
              Everything Your Manufacturing Business Needs
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#53645c] leading-relaxed">
              Powerful modules to streamline every department and automate your operations.
            </p>
          </div>

          {/* Grid of 9 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1: Sales Management */}
            <div className="reveal-on-scroll delay-reveal-100 group rounded-2xl border border-[#e3d8c5]/75 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:bg-white hover:border-[#176b5d]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10 mb-5 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1d2520] group-hover:text-[#176b5d] transition-colors">Sales Management</h3>
                <p className="mt-2 text-sm text-[#53645c] leading-relaxed mb-6">
                  Create sales orders, manage customers and track every order from start to delivery.
                </p>
              </div>
              
              {/* Interactive Mockup snippet */}
              <div className="rounded-xl border border-[#e3d8c5]/60 bg-[#fffaf5] p-4 text-[11px] font-medium transition-all group-hover:border-[#176b5d]/15 shadow-inner">
                <div className="flex items-center justify-between border-b border-[#e3d8c5]/40 pb-2 mb-2.5">
                  <span className="font-bold text-[#1d2520]">SO-1025</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSalesStep((prev) => (prev + 1) % 3); }}
                    className="rounded-md bg-[#eef7f3] border border-[#176b5d]/20 px-2 py-0.5 font-bold text-[#176b5d] hover:bg-[#176b5d] hover:text-white transition duration-200 cursor-pointer active:scale-95 text-[9px]"
                  >
                    {salesStep === 0 ? "Draft" : salesStep === 1 ? "Confirmed" : "Delivered"} ↺
                  </button>
                </div>
                <div className="flex justify-between items-center text-[#53645c]">
                  <span>Customer: Global Tradings</span>
                  <span className="font-bold text-[#1d2520]">$12,400.00</span>
                </div>
                
                {/* Horizontal progress indicators */}
                <div className="mt-3.5 flex items-center justify-between text-[9px] text-[#6a766f]">
                  <div className={`flex items-center gap-1 font-bold ${salesStep >= 0 ? "text-[#176b5d]" : "text-[#6a766f]"}`}>
                    <span className={`size-2 rounded-full flex items-center justify-center text-[6px] text-white ${salesStep >= 0 ? "bg-[#176b5d]" : "border border-[#cfc3ad] bg-white"}`}>
                      {salesStep >= 0 ? "✓" : ""}
                    </span>
                    <span>Draft</span>
                  </div>
                  <div className={`h-[1px] flex-1 mx-2 ${salesStep >= 1 ? "bg-[#176b5d]" : "bg-[#cfc3ad]"}`} />
                  <div className={`flex items-center gap-1 font-bold ${salesStep >= 1 ? "text-[#176b5d]" : "text-[#6a766f]"}`}>
                    <span className={`size-2 rounded-full flex items-center justify-center text-[6px] text-white ${salesStep >= 1 ? "bg-[#176b5d]" : "border border-[#cfc3ad] bg-white"}`}>
                      {salesStep >= 1 ? "✓" : ""}
                    </span>
                    <span>Confirmed</span>
                  </div>
                  <div className={`h-[1px] flex-1 mx-2 ${salesStep >= 2 ? "bg-[#176b5d]" : "bg-[#cfc3ad]"}`} />
                  <div className={`flex items-center gap-1 font-bold ${salesStep >= 2 ? "text-[#176b5d]" : "text-[#6a766f]"}`}>
                    <span className={`size-2 rounded-full flex items-center justify-center text-[6px] text-white ${salesStep >= 2 ? "bg-[#176b5d]" : "border border-[#cfc3ad] bg-white"}`}>
                      {salesStep >= 2 ? "✓" : ""}
                    </span>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Inventory Control */}
            <div className="reveal-on-scroll delay-reveal-200 group rounded-2xl border border-[#e3d8c5]/75 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:bg-white hover:border-[#176b5d]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10 mb-5 group-hover:scale-110 transition-transform">
                  <Package className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1d2520] group-hover:text-[#176b5d] transition-colors">Inventory Control</h3>
                <p className="mt-2 text-sm text-[#53645c] leading-relaxed mb-6">
                  Real-time tracking of stock. On-hand, reserved and available quantities.
                </p>
              </div>

              {/* Interactive Mockup snippet */}
              <div className="rounded-xl border border-[#e3d8c5]/60 bg-[#fffaf5] p-3 text-[10px] transition-all group-hover:border-[#176b5d]/15 shadow-inner">
                <table className="w-full text-left font-medium">
                  <thead>
                    <tr className="text-[#6a766f] border-b border-[#e3d8c5]/40 pb-1.5">
                      <th className="pb-1 font-bold">Item Name</th>
                      <th className="pb-1 text-center font-bold">Stock</th>
                      <th className="pb-1 text-right font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#1d2520] divide-y divide-[#e3d8c5]/20">
                    <tr>
                      <td className="py-1.5 font-bold">Oak Tops</td>
                      <td className="py-1.5 text-center font-semibold">18 units</td>
                      <td className="py-1.5 text-right">
                        <span className="rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[8px] font-bold text-amber-700">Low Stock</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold">Metal Legs</td>
                      <td className="py-1.5 text-center font-semibold">140 units</td>
                      <td className="py-1.5 text-right">
                        <span className="rounded-md bg-[#eef7f3] border border-[#176b5d]/10 px-1.5 py-0.5 text-[8px] font-bold text-[#176b5d]">In Stock</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card 3: Purchase Management */}
            <div className="reveal-on-scroll delay-reveal-300 group rounded-2xl border border-[#e3d8c5]/75 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:bg-white hover:border-[#176b5d]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10 mb-5 group-hover:scale-110 transition-transform">
                  <FileText className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1d2520] group-hover:text-[#176b5d] transition-colors">Purchase Management</h3>
                <p className="mt-2 text-sm text-[#53645c] leading-relaxed mb-6">
                  Manage vendors, create purchase orders and track receipts efficiently.
                </p>
              </div>

              {/* Interactive Mockup snippet */}
              <div className="rounded-xl border border-[#e3d8c5]/60 bg-[#fffaf5] p-4 text-[11px] font-medium transition-all group-hover:border-[#176b5d]/15 shadow-inner">
                <div className="flex items-center justify-between border-b border-[#e3d8c5]/40 pb-2 mb-2">
                  <span className="font-bold text-[#1d2520]">Purchase Order PO-0943</span>
                  <span className="rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 font-bold text-sky-700 text-[10px]">Received</span>
                </div>
                <div className="flex justify-between items-center text-[#53645c] mb-1">
                  <span>Vendor: Timberland Corp</span>
                  <span className="font-bold text-[#1d2520]">$4,850.00</span>
                </div>
                <div className="text-[9px] text-[#6a766f] flex items-center gap-1.5 mt-2">
                  <span className="size-1.5 rounded-full bg-sky-500" />
                  <span>Goods receipt synced to stock registers</span>
                </div>
              </div>
            </div>

            {/* Card 4: Manufacturing */}
            <div className="reveal-on-scroll delay-reveal-100 group rounded-2xl border border-[#e3d8c5]/75 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:bg-white hover:border-[#176b5d]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10 mb-5 group-hover:scale-110 transition-transform">
                  <Hammer className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1d2520] group-hover:text-[#176b5d] transition-colors">Manufacturing</h3>
                <p className="mt-2 text-sm text-[#53645c] leading-relaxed mb-6">
                  Plan, execute and track production from materials to finished products.
                </p>
              </div>

              {/* Interactive Mockup snippet */}
              <div className="rounded-xl border border-[#e3d8c5]/60 bg-[#fffaf5] p-3 text-[10px] transition-all group-hover:border-[#176b5d]/15 shadow-inner">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-[#1d2520]">Work Order MO-102</span>
                  <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 flex items-center gap-1 font-bold">
                    <span className="size-1 rounded-full bg-amber-500 animate-ping" />
                    Assembling
                  </span>
                </div>
                {/* Gantt / Mini Process bar layout */}
                <div className="space-y-2 mt-2">
                  <div>
                    <div className="flex justify-between text-[8px] text-[#6a766f] font-bold mb-0.5">
                      <span>Wood Cutting</span>
                      <span>100%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#e3d8c5]/40 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-[#176b5d]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[8px] text-[#6a766f] font-bold mb-0.5">
                      <span>Table Assembly</span>
                      <span>70%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#e3d8c5]/40 rounded-full overflow-hidden">
                      <div className="h-full w-[70%] bg-[#176b5d]/80 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Bill of Materials (BoM) */}
            <div className="reveal-on-scroll delay-reveal-200 group rounded-2xl border border-[#e3d8c5]/75 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:bg-white hover:border-[#176b5d]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10 mb-5 group-hover:scale-110 transition-transform">
                  <Layers className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1d2520] group-hover:text-[#176b5d] transition-colors">Bill of Materials (BoM)</h3>
                <p className="mt-2 text-sm text-[#53645c] leading-relaxed mb-6">
                  Create BoMs, manage components and versions to streamline manufacturing.
                </p>
              </div>

              {/* Interactive Mockup snippet */}
              <div className="rounded-xl border border-[#e3d8c5]/60 bg-[#fffaf5] p-3 text-[10px] font-medium transition-all group-hover:border-[#176b5d]/15 shadow-inner">
                <span className="font-bold text-[#1d2520] block mb-2 border-b border-[#e3d8c5]/40 pb-1">BOM-TAB-01: Dining Table</span>
                <ul className="space-y-1 text-[#53645c]">
                  <li className="flex items-center gap-2">
                    <span className="text-[#176b5d] font-bold">└</span>
                    <span className="font-bold text-[#1d2520]">1x</span> Oak Wood Panel
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#176b5d] font-bold">└</span>
                    <span className="font-bold text-[#1d2520]">4x</span> Steel Legs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#176b5d] font-bold">└</span>
                    <span className="font-bold text-[#1d2520]">16x</span> Hex Screws
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 6: Vendor Management */}
            <div className="reveal-on-scroll delay-reveal-300 group rounded-2xl border border-[#e3d8c5]/75 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:bg-white hover:border-[#176b5d]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10 mb-5 group-hover:scale-110 transition-transform">
                  <Truck className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1d2520] group-hover:text-[#176b5d] transition-colors">Vendor Management</h3>
                <p className="mt-2 text-sm text-[#53645c] leading-relaxed mb-6">
                  Track vendor performance, lead time, quality and purchase history.
                </p>
              </div>

              {/* Interactive Mockup snippet */}
              <div className="rounded-xl border border-[#e3d8c5]/60 bg-[#fffaf5] p-3 text-[10px] transition-all group-hover:border-[#176b5d]/15 shadow-inner">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-[#e3d8c5]/20 pb-1.5">
                    <span className="font-bold text-[#1d2520]">IronWorks Ltd</span>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500 font-bold">★</span>
                      <span className="font-bold text-[#1d2520]">4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[#53645c] text-[9px]">
                    <span>On-time Delivery: 99.2%</span>
                    <span className="font-bold text-[#176b5d]">Excellent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 7: Analytics & Reports */}
            <div className="reveal-on-scroll delay-reveal-100 group rounded-2xl border border-[#e3d8c5]/75 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:bg-white hover:border-[#176b5d]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10 mb-5 group-hover:scale-110 transition-transform">
                  <Activity className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1d2520] group-hover:text-[#176b5d] transition-colors">Analytics & Reports</h3>
                <p className="mt-2 text-sm text-[#53645c] leading-relaxed mb-6">
                  Powerful insights and reports to help you make smarter business decisions.
                </p>
              </div>

              {/* Interactive Mockup snippet */}
              <div className="rounded-xl border border-[#e3d8c5]/60 bg-[#fffaf5] p-3 text-[10px] transition-all group-hover:border-[#176b5d]/15 shadow-inner flex flex-col justify-between h-[84px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1d2520] text-[8px] uppercase tracking-wider">Metrics</span>
                  
                  {/* Selector tabs */}
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setAnalyticsMetric("sales"); }}
                      className={`px-1.5 py-0.5 rounded-[3px] text-[7px] font-bold border transition duration-200 cursor-pointer active:scale-95 ${analyticsMetric === "sales" ? "bg-[#176b5d] text-white border-[#176b5d]" : "bg-white text-[#53645c] border-[#e3d8c5]/60"}`}
                    >
                      Sales
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAnalyticsMetric("production"); }}
                      className={`px-1.5 py-0.5 rounded-[3px] text-[7px] font-bold border transition duration-200 cursor-pointer active:scale-95 ${analyticsMetric === "production" ? "bg-[#176b5d] text-white border-[#176b5d]" : "bg-white text-[#53645c] border-[#e3d8c5]/60"}`}
                    >
                      Prod
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between w-full h-[36px] mt-1.5">
                  {/* SVG Mini Bar Chart */}
                  <div className="flex items-end gap-2 h-full w-[45%]">
                    <div
                      className="w-3 bg-[#176b5d] rounded-t-[2px] transition-all duration-500 ease-out"
                      style={{ height: analyticsMetric === "sales" ? "30%" : "70%" }}
                    />
                    <div
                      className="w-3 bg-[#176b5d] rounded-t-[2px] transition-all duration-500 ease-out delay-75"
                      style={{ height: analyticsMetric === "sales" ? "55%" : "40%" }}
                    />
                    <div
                      className="w-3 bg-[#176b5d] rounded-t-[2px] transition-all duration-500 ease-out delay-150"
                      style={{ height: analyticsMetric === "sales" ? "85%" : "90%" }}
                    />
                  </div>
                  
                  {/* Mini Circle progress */}
                  <div className="relative size-8 flex items-center justify-center">
                    <svg className="size-full transform -rotate-90">
                      <circle cx="16" cy="16" r="13" stroke="#e3d8c5" strokeWidth="2.5" fill="transparent" />
                      <circle cx="16" cy="16" r="13" stroke="#176b5d" strokeWidth="2.5" fill="transparent"
                        strokeDasharray="81.6" strokeDashoffset={analyticsMetric === "sales" ? "24.5" : "12.2"}
                        className="transition-all duration-500 ease-out"
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[8px] font-bold text-[#1d2520]">
                      {analyticsMetric === "sales" ? "70%" : "85%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 8: Audit Logs */}
            <div className="reveal-on-scroll delay-reveal-200 group rounded-2xl border border-[#e3d8c5]/75 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:bg-white hover:border-[#176b5d]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10 mb-5 group-hover:scale-110 transition-transform">
                  <Clock className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1d2520] group-hover:text-[#176b5d] transition-colors">Audit Logs</h3>
                <p className="mt-2 text-sm text-[#53645c] leading-relaxed mb-6">
                  Complete activity tracking with detailed audit trails for transparency.
                </p>
              </div>

              {/* Interactive Mockup snippet */}
              <div className="rounded-xl border border-[#e3d8c5]/60 bg-[#fffaf5] p-3 text-[9px] font-medium transition-all group-hover:border-[#176b5d]/15 shadow-inner h-[84px] overflow-hidden flex flex-col justify-center">
                <div className="space-y-1.5 transition-all duration-500">
                  {auditLogs.map((log, index) => (
                    <div key={index} className="flex gap-2 text-[#53645c] items-start transition-all duration-500 animate-fadeIn">
                      <span className={`font-bold mt-0.5 shrink-0 ${log.type === "success" ? "text-[#176b5d]" : log.type === "warning" ? "text-[#9a4f16]" : "text-amber-500"}`}>•</span>
                      <div className="leading-tight truncate">
                        <span className="text-[#1d2520] font-bold text-[7px]">{log.time}</span> - <span className="font-semibold">{log.user}</span> {log.action} <span className="font-bold text-[#1d2520]">{log.target}</span> {log.diff && <span className="text-[#176b5d] font-bold">{log.diff}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 9: User & Role Management */}
            <div className="reveal-on-scroll delay-reveal-300 group rounded-2xl border border-[#e3d8c5]/75 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:bg-white hover:border-[#176b5d]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10 mb-5 group-hover:scale-110 transition-transform">
                  <Users className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1d2520] group-hover:text-[#176b5d] transition-colors">User & Role Management</h3>
                <p className="mt-2 text-sm text-[#53645c] leading-relaxed mb-6">
                  Manage users, roles and permissions with role-based access control.
                </p>
              </div>

              {/* Interactive Mockup snippet */}
              <div className="rounded-xl border border-[#e3d8c5]/60 bg-[#fffaf5] p-3 text-[10px] transition-all group-hover:border-[#176b5d]/15 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-[#176b5d] text-white flex items-center justify-center font-bold text-[10px]">
                      JD
                    </div>
                    <div>
                      <p className="font-bold text-[#1d2520] leading-none">John Doe</p>
                      <p className="text-[8px] text-[#6a766f] mt-0.5">johndoe@minierp.com</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-[#eef7f3] border border-[#176b5d]/20 px-2 py-0.5 text-[8px] font-bold text-[#176b5d]">
                    Sales Manager
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Dynamic Interactive Preview Section */}
        <section id="features" className="bg-white/50 border-t border-[#e3d8c5]/40 py-20 lg:py-28 relative">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="reveal-on-scroll">
                <span className="inline-flex rounded-lg border border-[#176b5d]/25 bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#176b5d] uppercase tracking-wide">
                  Live Operations
                </span>
                <h2 className="mt-4 text-3xl font-extrabold text-[#1d2520] sm:text-4xl tracking-tight leading-tight">
                  Connect Every Phase of Your Manufacturing Lifecycle
                </h2>
                <p className="mt-6 text-base text-[#53645c] leading-relaxed">
                  Unlike traditional siloed software, Mini ERP operates on a single connected ledger. Watch how a client sales order triggers direct material requirements, identifies component shortages, creates production orders, and automatically alerts purchase managers.
                </p>
                
                <div className="mt-8 space-y-4">
                  <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition duration-200">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10">
                      <ShoppingCart className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1d2520]">Sales triggers Production</h4>
                      <p className="text-xs text-[#53645c] mt-1">Confirmed orders instantly check component inventory levels automatically.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition duration-200">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10">
                      <Layers className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1d2520]">Automatic Bill of Materials Check</h4>
                      <p className="text-xs text-[#53645c] mt-1">The system breaks down custom products into legs, tops, and fasteners in real-time.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition duration-200">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#eef7f3] text-[#176b5d] border border-[#176b5d]/10">
                      <Award className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1d2520]">Full Auditing Built-In</h4>
                      <p className="text-xs text-[#53645c] mt-1">Track who confirmed, manufactured, or shipped items to ensure complete accountability.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Workflow Preview widget */}
              <div className="reveal-on-scroll delay-reveal-200 relative rounded-2xl border border-[#e3d8c5]/75 bg-white p-6 shadow-xl shadow-[#cfc3ad]/10">
                <div className="absolute top-[-15px] right-[20px] rounded-lg bg-[#176b5d] px-3.5 py-1 text-xs font-bold text-white shadow-md">
                  Active Lifecycle Preview
                </div>
                
                <div className="mb-6 flex items-center justify-between border-b border-[#e3d8c5]/40 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#176b5d] uppercase tracking-wider">Operational Pipeline</span>
                    <h3 className="text-lg font-extrabold text-[#1d2520] mt-0.5">Order Flow: SO-1024</h3>
                  </div>
                  <span className="rounded-lg bg-[#ffe1a6] px-3 py-1.5 text-xs font-bold text-[#765318] border border-amber-300">
                    Confirmed
                  </span>
                </div>

                {/* Workflow step items */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#eef7f3] bg-[#eef7f3]/40 p-4 transition-all duration-300 hover:scale-101 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#176b5d] text-[10px] font-bold text-white">1</span>
                        <span className="text-xs font-bold text-[#1d2520]">Sales Order Received</span>
                      </div>
                      <span className="text-[10px] text-[#53645c] font-semibold">20x Dining Tables</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e3d8c5]/30 bg-white p-4 transition-all duration-300 hover:scale-101 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#176b5d] text-[10px] font-bold text-white">2</span>
                        <span className="text-xs font-bold text-[#1d2520]">Inventory Check & Shortage</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#9a4f16] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">15 Units Short</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e3d8c5]/30 bg-white p-4 transition-all duration-300 hover:scale-101 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#176b5d] text-[10px] font-bold text-white">3</span>
                        <span className="text-xs font-bold text-[#1d2520]">Manufacturing Order Triggered</span>
                      </div>
                      <span className="text-[10px] text-[#5f5aa2] bg-[#5f5aa2]/10 px-2 py-0.5 rounded font-semibold">MO-001 Created</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e3d8c5]/30 bg-white p-4 transition-all duration-300 hover:scale-101 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#176b5d] text-[10px] font-bold text-white">4</span>
                        <span className="text-xs font-bold text-[#1d2520]">Procurement & Materials Breakdown</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#176b5d] bg-[#eef7f3] px-2 py-0.5 rounded">PO Calculated</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#e3d8c5]/40 pt-4 flex justify-between items-center text-[11px] text-[#6a766f] font-semibold">
                  <span>PostgreSQL-backed relational tracking</span>
                  <Link href="/signup" className="text-[#176b5d] hover:underline flex items-center gap-1 font-bold">
                    Try now <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / Call to Action CTA section */}
        <section id="pricing" className="reveal-on-scroll mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28 text-center relative">
          <div className="rounded-3xl bg-radial from-[#1e302a] to-[#121c19] text-white p-8 sm:p-12 lg:p-20 shadow-2xl relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[40%] aspect-square rounded-full bg-[#176b5d]/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] aspect-square rounded-full bg-[#ffe1a6]/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-[#176b5d] bg-[#eef7f3]/10 border border-[#176b5d]/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                Full-Access Trials
              </span>
              <h2 className="mt-6 text-3xl font-extrabold sm:text-4xl lg:text-5xl leading-tight tracking-tight">
                Streamline Your Entire Shop Floor Operation Today
              </h2>
              <p className="mt-6 text-sm sm:text-base text-[#b8c5bd] leading-relaxed max-w-xl mx-auto">
                No credit cards required. Set up your team in minutes and experience the difference of a database-connected ERP workflow.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#176b5d] hover:bg-[#12574b] text-white px-8 text-base font-semibold transition-all shadow-md shadow-[#176b5d]/10 hover:shadow-[#176b5d]/20 active:scale-98"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-[#b8c5bd]/30 bg-white/5 text-white hover:bg-white/10 px-8 text-base font-semibold transition-all active:scale-98"
                >
                  Log In as Demo User
                </Link>
              </div>

              <p className="mt-6 text-xs text-[#8ca094] font-medium">
                Backed by real PostgreSQL schema migrations and audit trail ledgers.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#e3d8c5]/40 bg-[#1d2520] text-white py-12 px-6 sm:px-8 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#176b5d] text-sm font-bold text-white">
              ERP
            </span>
            <div>
              <span className="text-md font-bold text-white tracking-tight">Mini ERP</span>
              <p className="text-[10px] text-[#b8c5bd]">© 2026. All Rights Reserved.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-semibold text-[#b8c5bd]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#modules" className="hover:text-white transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
