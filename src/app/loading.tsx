import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading workspace components...
        </p>
      </div>
    </div>
  );
}
