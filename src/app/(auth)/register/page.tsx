import { RegisterForm } from "@/components/forms/register-form";
import Link from "next/link";

export const metadata = {
  title: "Create Account | PreCar Inspect",
  description: "Create an account on PreCar Inspect to book vehicle inspections or manage inspection tasks.",
};

export default function RegisterPage() {
  return (
    <>
      <div className="flex flex-col gap-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-gradient">
          Get Started
        </h2>
        <p className="text-sm text-muted-foreground">
          Create an account to access our pre-owned car inspection platform
        </p>
      </div>

      <RegisterForm />

      <div className="text-center text-sm text-muted-foreground/80 mt-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </>
  );
}
