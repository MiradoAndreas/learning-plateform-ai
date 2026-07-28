// roadmap-flow-nodes.tsx

import { CheckCircle2Icon, GitBranchIcon, LockIcon } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFlagTransition } from "../../lib/roadmap-flow-node-animation";

// ✅ Ajout de largeurs fixes
const NODE_WIDTH = 200;

export function CenterNode({ data }: { data: { label: string } }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="truncate rounded-md border-2 border-yellow-400 bg-yellow-200 px-4 py-2 text-sm font-semibold text-yellow-950 shadow-sm"
          style={{
            width: NODE_WIDTH,
            textAlign: "center",
            pointerEvents: "auto",
          }}
        >
          <Handle
            type="target"
            position={Position.Top}
            id="target-top"
            className="opacity-0"
          />
          {data.label}
          <Handle
            type="source"
            position={Position.Left}
            id="source-left"
            className="opacity-0"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="source-right"
            className="opacity-0"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="source-bottom"
            className="opacity-0"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{data.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

type TopicNodeData = {
  label: string;
  side: "left" | "right";
  locked?: boolean;
  completed?: boolean;
};

export function TopicNode({ data }: { data: TopicNodeData }) {
  const { locked, completed } = data;
  const justUnlocked = useFlagTransition(locked, { from: true, to: false });
  const justCompleted = useFlagTransition(completed, { from: false, to: true });

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "truncate rounded-md border px-4 py-2 text-sm shadow-sm transition-all duration-500",
            completed
              ? "border-emerald-400 bg-emerald-50 text-emerald-950"
              : locked
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                : "cursor-pointer border-orange-300 bg-orange-100 text-orange-950",
            justUnlocked && "animate-node-unlock",
            justCompleted && "animate-node-complete",
          )}
          style={{
            width: NODE_WIDTH,
            textAlign: "center",
            pointerEvents: "auto",
            opacity: locked ? 0.6 : 1,
          }}
        >
          {data.side === "left" ? (
            <Handle
              type="target"
              position={Position.Right}
              id="target-right"
              className="opacity-0"
            />
          ) : (
            <Handle
              type="target"
              position={Position.Left}
              id="target-left"
              className="opacity-0"
            />
          )}
          <div className="flex items-center justify-center gap-x-1.5">
            {locked && <LockIcon className="h-3 w-3 shrink-0" />}
            {completed && (
              <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            )}
            <span className="truncate">{data.label}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {locked
            ? "Terminez le sujet précédent pour débloquer celui-ci"
            : data.label}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

type ChoiceNodeData = {
  label: string;
  locked?: boolean;
  completed?: boolean;
};

export function ChoiceNode({ data }: { data: ChoiceNodeData }) {
  const { locked, completed } = data;
  const justUnlocked = useFlagTransition(locked, { from: true, to: false });
  const justCompleted = useFlagTransition(completed, { from: false, to: true });

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center justify-center gap-x-1.5 rounded-md border-2 border-dashed px-3 py-2 text-xs font-semibold shadow-sm transition-all duration-500",
            completed
              ? "border-emerald-400 bg-emerald-50 text-emerald-900"
              : locked
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                : "cursor-pointer border-indigo-400 bg-indigo-50 text-indigo-900",
            justUnlocked && "animate-node-unlock",
            justCompleted && "animate-node-complete",
          )}
          style={{
            width: NODE_WIDTH,
            pointerEvents: "auto",
            opacity: locked ? 0.6 : 1,
          }}
        >
          <Handle
            type="target"
            position={Position.Left}
            id="target-left"
            className="opacity-0"
          />
          <Handle
            type="target"
            position={Position.Right}
            id="target-right"
            className="opacity-0"
          />
          {locked ? (
            <LockIcon className="h-3.5 w-3.5 shrink-0" />
          ) : completed ? (
            <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          ) : (
            <GitBranchIcon className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="text-center">{data.label}</span>

          <Handle
            type="source"
            position={Position.Left}
            id="source-left"
            className="opacity-0"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="source-right"
            className="opacity-0"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {locked
            ? "Terminez l'étape précédente pour débloquer ce choix"
            : data.label}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

type OptionNodeData = {
  label: string;
  recommendation: "recommended" | "alternative" | "none";
  note?: string;
  side: "left" | "right";
  locked?: boolean;
};

export function OptionNode({ data }: { data: OptionNodeData }) {
  const { locked } = data;
  const justUnlocked = useFlagTransition(locked, { from: true, to: false });

  const truncatedLabel =
    data.label.length > 20 ? data.label.slice(0, 20) + "..." : data.label;
  const truncatedNote =
    data.note && data.note.length > 30
      ? data.note.slice(0, 30) + "..."
      : data.note;

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "rounded-md border px-3 py-2 text-xs shadow-sm transition-all duration-500",
            locked
              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              : data.recommendation === "recommended"
                ? "border-green-400 bg-green-50 text-green-900"
                : data.recommendation === "alternative"
                  ? "border-blue-300 bg-blue-50 text-blue-900"
                  : "border-slate-200 bg-slate-50 text-slate-700",
            justUnlocked && "animate-node-unlock",
          )}
          style={{
            width: NODE_WIDTH,
            pointerEvents: "auto",
            opacity: locked ? 0.55 : 1,
          }}
        >
          {data.side === "left" ? (
            <Handle
              type="target"
              position={Position.Right}
              id="target-right"
              className="opacity-0"
            />
          ) : (
            <Handle
              type="target"
              position={Position.Left}
              id="target-left"
              className="opacity-0"
            />
          )}
          <div className="flex flex-col items-center gap-y-1">
            <div className="flex items-center gap-x-1.5">
              {locked && <LockIcon className="h-3 w-3 shrink-0" />}
              {!locked && data.recommendation === "recommended" && (
                <span className="rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-semibold text-white uppercase">
                  R
                </span>
              )}
              {!locked && data.recommendation === "alternative" && (
                <span className="rounded-full bg-blue-400 px-1.5 py-0.5 text-[9px] font-semibold text-white uppercase">
                  A
                </span>
              )}
              <span className="truncate text-center font-medium">
                {truncatedLabel}
              </span>
            </div>
            {data.note && !locked && (
              <p className="text-center text-[10px] text-muted-foreground">
                {truncatedNote}
              </p>
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="flex max-w-xs flex-col items-center">
        <p>{data.label}</p>
        {data.note && !locked && (
          <p className="text-xs text-muted-foreground">{data.note}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function SectionLabelNode({ data }: { data: { label: string } }) {
  return (
    <div className="text-md text-center font-semibold text-primary">
      {data.label}
    </div>
  );
}
