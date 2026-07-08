"use client";

import { useRef, useState, useCallback } from "react";
import { Mermaid } from "@/components/mermaidcn/mermaid";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export function ZoomableDiagramSvg({ chart }: { chart: string }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const zoomIn = () => setScale((s) => Math.min(s * 1.2, 5));
  const zoomOut = () => setScale((s) => Math.max(s / 1.2, 0.2));
  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => {
      const next = s * (e.deltaY < 0 ? 1.1 : 0.9);
      return Math.min(Math.max(next, 0.2), 5);
    });
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPosition((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative h-[75vh] w-full overflow-hidden rounded-lg border bg-white select-none">
      <div className="absolute top-2 right-2 z-10 flex gap-1 rounded-md border bg-background p-1 shadow">
        <Button size="icon" variant="ghost" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="flex items-center px-2 text-sm tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <Button size="icon" variant="ghost" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={reset}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="origin-center transition-transform duration-75"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <Mermaid
            chart={chart}
            config={{
              fontSize: 16,
            }}
          />
        </div>
      </div>
    </div>
  );
}
