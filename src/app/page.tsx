import Link from "next/link";
import { Car, ShieldCheck, ClipboardCheck, Sparkles, Smartphone, Award, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary)_0%,_transparent_40%),_radial-gradient(ellipse_at_bottom_left,_var(--color-secondary)_0%,_transparent_45%)] bg-background">
      {/* Navbar */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-white/5 bg-card/15 backdrop-blur-xl sticky top-0 z-40 w-full">
        <Link href="/" className="flex items-center gap-3">
          <Car className="h-6 w-6 text-primary" />
          <span className="font-extrabold text-xl text-gradient-primary tracking-tight">
            PreCar Inspect
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary">Register</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 max-w-5xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold mb-6 animate-pulse select-none">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Generation Pre-Owned Car Inspections</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gradient leading-none max-w-4xl">
          Inspect Pre-Owned Vehicles With Absolute Confidence
        </h1>
        <p className="text-muted-foreground text-base md:text-xl mt-6 max-w-2xl">
          Get mobile-ready inspections, expert checklists, automated scoring, and professional branded PDF reports. Built for customers, inspectors, and admins.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8">
              Get Started Now
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
              Access Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-28 px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 relative z-10 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gradient">
            Engineered For Every Step
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            All-in-one suite covering bookings, inspection flow, reporting, and management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ClipboardCheck className="h-6 w-6 stroke-1.5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Comprehensive Checklists
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Standardized 60+ item audits covering engine mechanicals, suspension, electrical compliance, tyres, and overall body panels.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Smartphone className="h-6 w-6 stroke-1.5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Mobile-First PWA
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built for inspectors performing reviews in garages and lots. Capture details, take photos/videos, and work offline seamlessly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="h-6 w-6 stroke-1.5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Professional PDF Reports
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automated score calculations, critical red-flags summary, and beautiful branded PDF certificates with QR codes for sharing.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 md:py-28 px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 relative z-10 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gradient">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Choose the inspection package that suits your vehicle buying needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col border border-white/5 relative bg-card/25">
            <h3 className="text-lg font-bold text-foreground">Basic Inspection</h3>
            <p className="text-xs text-muted-foreground mt-1">Perfect for entry-level hatchbacks</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-foreground">₹1,999</span>
              <span className="text-sm text-muted-foreground">/ vehicle</span>
            </div>
            <ul className="mt-8 space-y-3 flex-1 text-sm text-muted-foreground/80">
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>35+ Point Checklist</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Exterior & Interior Inspection</span>
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground/45">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Engine Diagnostics Scan</span>
              </li>
            </ul>
            <Link href="/register" className="mt-8">
              <Button variant="outline" className="w-full">Choose Basic</Button>
            </Link>
          </div>

          {/* Plan 2 - Featured */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col border-2 border-primary relative bg-card/40 shadow-xl shadow-primary/5">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-lg font-bold text-foreground">Standard Audit</h3>
            <p className="text-xs text-muted-foreground mt-1">Recommended for sedans & SUVs</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-foreground">₹3,499</span>
              <span className="text-sm text-muted-foreground">/ vehicle</span>
            </div>
            <ul className="mt-8 space-y-3 flex-1 text-sm text-muted-foreground/85">
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>60+ Point Checklist</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Engine & Mechanical Systems</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Basic Road Test Inspection</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>PDF Report & QR Share Link</span>
              </li>
            </ul>
            <Link href="/register" className="mt-8">
              <Button variant="primary" className="w-full">Choose Standard</Button>
            </Link>
          </div>

          {/* Plan 3 */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col border border-white/5 relative bg-card/25">
            <h3 className="text-lg font-bold text-foreground">Premium Scan</h3>
            <p className="text-xs text-muted-foreground mt-1">For luxury cars & comprehensive safety audits</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-foreground">₹5,499</span>
              <span className="text-sm text-muted-foreground">/ vehicle</span>
            </div>
            <ul className="mt-8 space-y-3 flex-1 text-sm text-muted-foreground/80">
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>80+ Point Premium Checklist</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Full OBD Scanner Diagnostics</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Suspension & Underbody Lift Audit</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Dedicated Advisor Recommendations</span>
              </li>
            </ul>
            <Link href="/register" className="mt-8">
              <Button variant="outline" className="w-full">Choose Premium</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-black/35 relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center px-6 flex flex-col items-center gap-6">
          <Award className="h-12 w-12 text-primary" />
          <h2 className="text-3xl font-extrabold text-gradient">
            Ready to inspect your next purchase?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
            Register your vehicle details, select an inspection plan, and get a certified auditor on-site in no time.
          </p>
          <Link href="/register" className="mt-4">
            <Button size="lg" className="px-8 shadow-lg shadow-primary/20">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
