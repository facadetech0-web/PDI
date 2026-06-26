import Link from "next/link";
import { MailCheck } from "lucide-react";

export const metadata = {
  title: "Verify Email | PreCar Inspect",
  description: "Verify your email address to get started with PreCar Inspect.",
};

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
        <MailCheck className="h-8 w-8 stroke-1.5 animate-bounce" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-gradient">
          Check your email
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          We&apos;ve sent a verification link to your email address. Please click it to verify your account.
        </p>
      </div>

      <div className="w-full border-t border-white/5 pt-4 text-sm text-muted-foreground/80">
        Already verified?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
