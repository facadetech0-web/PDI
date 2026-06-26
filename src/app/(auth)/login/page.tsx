import { LoginForm } from "@/components/forms/login-form";
import Link from "next/link";

export const metadata = {
  title: "Login | PreCar Inspect",
  description: "Sign in to your PreCar Inspect account to manage your bookings and reports.",
};

export default function LoginPage() {
  return (
    <>
      <div className="flex flex-col gap-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-gradient">
          Welcome back
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your dashboard
        </p>
      </div>

      <LoginForm />

      <div className="text-center text-sm text-muted-foreground/80 mt-2">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Sign Up
        </Link>
      </div>
    </>
  );
}
