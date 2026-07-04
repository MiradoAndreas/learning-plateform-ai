"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OnboardingSuccessProps {
  onContinue?: () => void;
}

export function OnboardingSuccess({ onContinue }: OnboardingSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-sm space-y-8 py-10 text-center"
    >
      {/* Icône unique et significative : confirme l'état de succès, rien d'ornemental autour */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary">
        <CheckCircle2 className="h-7 w-7 text-primary" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          You&apos;re all set
        </h2>
        <p className="text-sm text-muted-foreground">
          Your personalized learning journey has been created.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button
          asChild
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </motion.div>
  );
}
