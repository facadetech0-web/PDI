import { ProfileForm } from "@/components/forms/profile-form";

export const metadata = {
  title: "Profile Settings | PreCar Inspect",
  description: "Update your full name, phone number, and password details.",
};

export default function CustomerProfilePage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
          Profile Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal details and account credentials
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
