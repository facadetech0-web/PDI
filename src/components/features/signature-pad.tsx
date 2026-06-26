"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface SignaturePadProps {
  value?: string; // base64 data url
  onChange?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SignaturePad({ value, onChange, onClear, placeholder = "Draw your signature here" }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [isEmpty, setIsEmpty] = React.useState(true);

  // Initialize canvas context settings
  const getContext = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return ctx;
  }, []);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = getContext();
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = getContext();
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.releasePointerCapture(e.pointerId);
    setIsDrawing(false);

    // Save as base64 data url
    if (onChange) {
      onChange(canvas.toDataURL());
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    if (onChange) {
      onChange("");
    }
    if (onClear) {
      onClear();
    }
  };

  // Adjust canvas pixel resolution to match bounding client rect size
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      
      // Store current drawing before resizing resets canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx && canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Re-apply stroke settings
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#38bdf8"; // Premium sky blue stroke
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        // Restore previous drawing scaled if needed
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
          ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
        }
      }
    };

    resizeCanvas();
    
    // If a value is provided, draw it on the canvas
    if (value) {
      const img = new Image();
      img.src = value;
      img.onload = () => {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setIsEmpty(false);
        }
      };
    }
    
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [value]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative border border-slate-800 bg-slate-950/40 rounded-xl overflow-hidden h-44 cursor-crosshair">
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-muted-foreground/45 text-xs font-medium">
            {placeholder}
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          className="border-slate-850 hover:bg-slate-900/60 text-xs gap-1.5 h-8 px-3"
        >
          <Eraser className="h-3.5 w-3.5" />
          Clear Pad
        </Button>
      </div>
    </div>
  );
}
