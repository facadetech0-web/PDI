import Link from "next/link";
import { Car, Mail, Phone, MapPin } from "lucide-react";
import { APP_NAME, COMPANY_NAME } from "@/lib/utils/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-white/5 mt-auto relative z-10">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo + branding */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Car className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-gradient-primary tracking-tight">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Premium, mobile-first vehicle inspection platform. Professional reports, expert checklist audits, and fast turnaround.
            </p>
          </div>

          {/* Nav links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Platform</h3>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Pricing Plans
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Blog Articles
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Legal</h3>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact details */}
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Contact Support</h3>
              <ul role="list" className="mt-4 space-y-3">
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>support@precarinspect.com</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>+91-9876543210</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="leading-tight">123 Tech Square, Bangalore, India</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="mt-12 border-t border-white/5 pt-8 md:flex md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground/60 md:order-1">
            &copy; {currentYear} {COMPANY_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
