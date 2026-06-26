import Link from "next/link";
import { CarFront, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary)_0%,_transparent_40%),_radial-gradient(ellipse_at_bottom_left,_var(--color-secondary)_0%,_transparent_40%)] bg-background">
      <div className="max-w-md text-center flex flex-col items-center gap-6 glass-panel p-8 rounded-2xl bg-card/45 shadow-2xl relative overflow-hidden">
        {/* Abstract grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary">
          <CarFront className="h-10 w-10 animate-bounce" />
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <h1 className="text-6xl font-extrabold tracking-wider text-gradient-primary">
            404
          </h1>
          <h2 className="text-xl font-bold text-foreground mt-2">
            Lost in Transit
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            The page you are looking for has been moved, deleted, or does not exist. Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex items-center gap-4 mt-2 relative z-10 w-full">
          <Link href="/" className="w-full">
            <Button variant="primary" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
