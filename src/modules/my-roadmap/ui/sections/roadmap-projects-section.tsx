// src/modules/my-roadmap/ui/sections/roadmap-projects-section.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  ClockIcon,
  TargetIcon,
  FilterIcon,
  UploadIcon,
  XIcon,
  CalendarIcon,
  UserIcon,
  BookOpenIcon,
  CheckCircleIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { GeneratingIndicator } from "@/modules/roadmap/ui/components/generating-indicator";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SKILL_LEVELS,
  SkillLevel,
} from "../../../../../convex/roadmap/constants";

type RoadmapProjectsSectionProps = {
  roadmapId: Id<"roadmaps">;
};

// Type pour un projet
type Project = {
  _id: Id<"roadmapProjects">;
  level: string;
  title: string;
  description: string;
  objectives: string[];
  estimatedDuration?: string;
  prerequisites?: string[];
  technologies?: string[];
  learningOutcomes?: string[];
};

// Map des couleurs basées sur les variables CSS
const LEVEL_STYLES: Record<
  SkillLevel,
  {
    bg: string;
    text: string;
    border: string;
    badge: string;
    badgeBorder: string;
    cardBg: string;
    filterBadge: string;
    modalBadge: string;
    modalBorder: string;
    modalBg: string;
  }
> = {
  Novice: {
    bg: "bg-blue-50/50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-200 dark:border-blue-700",
    cardBg: "hover:bg-blue-50/70 dark:hover:bg-blue-950/40 cursor-pointer",
    filterBadge:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    modalBadge:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    modalBorder: "border-blue-200 dark:border-blue-800",
    modalBg: "bg-blue-50/30 dark:bg-blue-950/20",
  },
  Apprentice: {
    bg: "bg-cyan-50/50 dark:bg-cyan-950/30",
    text: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800",
    badge: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300",
    badgeBorder: "border-cyan-200 dark:border-cyan-700",
    cardBg: "hover:bg-cyan-50/70 dark:hover:bg-cyan-950/40 cursor-pointer",
    filterBadge:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700",
    modalBadge:
      "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
    modalBorder: "border-cyan-200 dark:border-cyan-800",
    modalBg: "bg-cyan-50/30 dark:bg-cyan-950/20",
  },
  Intermediate: {
    bg: "bg-emerald-50/50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    badge:
      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    badgeBorder: "border-emerald-200 dark:border-emerald-700",
    cardBg:
      "hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 cursor-pointer",
    filterBadge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
    modalBadge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    modalBorder: "border-emerald-200 dark:border-emerald-800",
    modalBg: "bg-emerald-50/30 dark:bg-emerald-950/20",
  },
  Competent: {
    bg: "bg-green-50/50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    badge:
      "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
    badgeBorder: "border-green-200 dark:border-green-700",
    cardBg: "hover:bg-green-50/70 dark:hover:bg-green-950/40 cursor-pointer",
    filterBadge:
      "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700",
    modalBadge:
      "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300",
    modalBorder: "border-green-200 dark:border-green-800",
    modalBg: "bg-green-50/30 dark:bg-green-950/20",
  },
  Advanced: {
    bg: "bg-yellow-50/50 dark:bg-yellow-950/30",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
    badge:
      "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300",
    badgeBorder: "border-yellow-200 dark:border-yellow-700",
    cardBg: "hover:bg-yellow-50/70 dark:hover:bg-yellow-950/40 cursor-pointer",
    filterBadge:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
    modalBadge:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300",
    modalBorder: "border-yellow-200 dark:border-yellow-800",
    modalBg: "bg-yellow-50/30 dark:bg-yellow-950/20",
  },
  Expert: {
    bg: "bg-orange-50/50 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    badge:
      "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300",
    badgeBorder: "border-orange-200 dark:border-orange-700",
    cardBg: "hover:bg-orange-50/70 dark:hover:bg-orange-950/40 cursor-pointer",
    filterBadge:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-700",
    modalBadge:
      "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    modalBorder: "border-orange-200 dark:border-orange-800",
    modalBg: "bg-orange-50/30 dark:bg-orange-950/20",
  },
  Master: {
    bg: "bg-red-50/50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
    badgeBorder: "border-red-200 dark:border-red-700",
    cardBg: "hover:bg-red-50/70 dark:hover:bg-red-950/40 cursor-pointer",
    filterBadge:
      "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700",
    modalBadge: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
    modalBorder: "border-red-200 dark:border-red-800",
    modalBg: "bg-red-50/30 dark:bg-red-950/20",
  },
  Authority: {
    bg: "bg-purple-50/50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    badge:
      "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
    badgeBorder: "border-purple-200 dark:border-purple-700",
    cardBg: "hover:bg-purple-50/70 dark:hover:bg-purple-950/40 cursor-pointer",
    filterBadge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-700",
    modalBadge:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
    modalBorder: "border-purple-200 dark:border-purple-800",
    modalBg: "bg-purple-50/30 dark:bg-purple-950/20",
  },
  Legend: {
    bg: "bg-pink-50/50 dark:bg-pink-950/30",
    text: "text-pink-700 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800",
    badge: "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300",
    badgeBorder: "border-pink-200 dark:border-pink-700",
    cardBg: "hover:bg-pink-50/70 dark:hover:bg-pink-950/40 cursor-pointer",
    filterBadge:
      "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 border-pink-200 dark:border-pink-700",
    modalBadge:
      "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300",
    modalBorder: "border-pink-200 dark:border-pink-800",
    modalBg: "bg-pink-50/30 dark:bg-pink-950/20",
  },
  Grandmaster: {
    bg: "bg-amber-50/50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    badge:
      "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-200 dark:border-amber-700",
    cardBg: "hover:bg-amber-50/70 dark:hover:bg-amber-950/40 cursor-pointer",
    filterBadge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-700",
    modalBadge:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    modalBorder: "border-amber-200 dark:border-amber-800",
    modalBg: "bg-amber-50/30 dark:bg-amber-950/20",
  },
};

// Composant pour le filtre des niveaux
const LevelFilter = ({
  selectedLevels,
  onToggleLevel,
  onClearAll,
}: {
  selectedLevels: Set<SkillLevel>;
  onToggleLevel: (level: SkillLevel) => void;
  onClearAll: () => void;
}) => {
  return (
    <div className="flex max-w-75 flex-wrap gap-1.5 p-2">
      {SKILL_LEVELS.map((level) => {
        const styles = LEVEL_STYLES[level];
        const isSelected = selectedLevels.has(level);
        return (
          <button
            key={level}
            onClick={() => onToggleLevel(level)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all duration-200",
              styles.filterBadge,
              isSelected
                ? "ring-2 ring-primary ring-offset-1 dark:ring-offset-background"
                : "opacity-60 hover:opacity-100",
            )}
          >
            {level}
          </button>
        );
      })}
      {selectedLevels.size > 0 && (
        <button
          onClick={onClearAll}
          className="rounded-full border bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/80"
        >
          Tout afficher
        </button>
      )}
    </div>
  );
};

// Composant Modal pour les détails du projet
const ProjectDetailModal = ({
  project,
  roadmapId,
  isOpen,
  onClose,
}: {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  roadmapId: Id<"roadmaps">;
}) => {
  if (!project) return null;

  const level = project.level as SkillLevel;
  const styles = LEVEL_STYLES[level] || LEVEL_STYLES.Novice;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-h-[90vh] max-w-2xl overflow-y-auto",
          "border-2",
          styles.modalBorder,
        )}
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <DialogTitle className="text-xl leading-tight font-semibold">
                {project.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    "border text-xs font-medium",
                    styles.modalBadge,
                    styles.modalBorder,
                  )}
                >
                  {project.level}
                </Badge>
                {project.estimatedDuration && (
                  <Badge variant="outline" className="text-xs">
                    <ClockIcon className="mr-1 h-3 w-3" />
                    {project.estimatedDuration}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-6">
            {/* Description */}
            <div
              className={cn(
                "rounded-lg border p-4",
                styles.modalBg,
                styles.modalBorder,
              )}
            >
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <BookOpenIcon className="h-4 w-4" />
                Description
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
                {project.description}
              </p>
            </div>

            {/* Objectifs */}
            {project.objectives.length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <TargetIcon className="h-4 w-4" />
                  Objectifs du projet
                </h4>
                <ul className="space-y-2">
                  {project.objectives.map((objective, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prérequis */}
            {project.prerequisites && project.prerequisites.length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <UserIcon className="h-4 w-4" />
                  Prérequis
                </h4>
                <ul className="space-y-1.5">
                  {project.prerequisites.map((prereq, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="text-primary">•</span>
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <CalendarIcon className="h-4 w-4" />
                  Technologies utilisées
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Résultats d'apprentissage */}
            {project.learningOutcomes &&
              project.learningOutcomes.length > 0 && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <TargetIcon className="h-4 w-4" />
                    Résultats d&apos;apprentissage
                  </h4>
                  <ul className="space-y-1.5">
                    {project.learningOutcomes.map((outcome, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <span className="text-primary">✦</span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            <ProjectSubmissionPanel
              roadmapId={roadmapId}
              projectId={project._id}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const statusLabels: Record<string, string> = {
  uploaded: "En file d'attente",
  reviewing: "Analyse en cours...",
  completed: "Terminé",
  failed: "Échec de l'analyse",
};

const ProjectSubmissionPanel = ({
  roadmapId,
  projectId,
}: {
  roadmapId: Id<"roadmaps">;
  projectId: Id<"roadmapProjects">;
}) => {
  const submissions = useQuery(
    api.roadmap.submissions.queries.listProjectSubmissions,
    { projectId },
  );
  const generateUploadUrl = useMutation(
    api.roadmap.submissions.mutation.generateSubmissionUploadUrl,
  );
  const submitProject = useMutation(
    api.roadmap.submissions.mutation.submitProject,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setUploadError("Seuls les fichiers .zip sont acceptés");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError("Le fichier ne doit pas dépasser 20 Mo");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/zip" },
        body: file,
      });

      if (!result.ok) throw new Error("Échec de l'envoi du fichier");

      const { storageId } = await result.json();

      await submitProject({
        roadmapId,
        projectId,
        storageId,
        fileName: file.name,
      });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const latestSubmission = submissions?.[0];

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-x-2">
        <h4 className="flex items-center gap-2 text-sm font-medium">
          <UploadIcon className="h-4 w-4" />
          Soumettre mon projet
        </h4>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Envoi..." : "Choisir un fichier .zip"}
        </Button>
      </div>

      {uploadError && (
        <p className="mb-2 text-xs text-destructive">{uploadError}</p>
      )}

      {!latestSubmission ? (
        <p className="text-xs text-muted-foreground">
          Aucune soumission pour ce projet pour le moment.
        </p>
      ) : (
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <span className="truncate text-xs text-muted-foreground">
              {latestSubmission.fileName}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                latestSubmission.status === "completed" &&
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
                latestSubmission.status === "failed" &&
                  "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
                (latestSubmission.status === "uploaded" ||
                  latestSubmission.status === "reviewing") &&
                  "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
              )}
            >
              {statusLabels[latestSubmission.status]}
            </span>
          </div>

          {latestSubmission.status === "completed" && (
            <div className="flex flex-col gap-y-2 rounded-md bg-muted/50 p-3">
              <div className="flex items-baseline gap-x-1.5">
                <span className="text-2xl font-bold">
                  {latestSubmission.score}
                </span>
                <span className="text-xs text-muted-foreground">/ 10</span>
              </div>
              <p className="text-xs text-foreground/80">
                {latestSubmission.summary}
              </p>

              {!!latestSubmission.strengths?.length && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    Points forts
                  </p>
                  <ul className="list-disc pl-4 text-[11px] text-foreground/80">
                    {latestSubmission.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!!latestSubmission.improvements?.length && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    Pistes d&apos;amélioration
                  </p>
                  <ul className="list-disc pl-4 text-[11px] text-foreground/80">
                    {latestSubmission.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {latestSubmission.status === "failed" && (
            <p className="text-xs text-destructive">
              {latestSubmission.errorMessage ?? "Une erreur est survenue"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const RoadmapProjectsSection = ({
  roadmapId,
}: RoadmapProjectsSectionProps) => {
  const projects = useQuery(api.roadmap.queries.getRoadmapProjects, {
    roadmapId,
  });

  const submissionsSummary = useQuery(
    api.roadmap.submissions.queries.getSubmissionsSummaryByRoadmap,
    { roadmapId },
  );

  const isMobile = useIsMobile();
  const [selectedLevels, setSelectedLevels] = useState<Set<SkillLevel>>(
    new Set(),
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrer les projets
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (selectedLevels.size === 0) return projects;
    return projects.filter((project) =>
      selectedLevels.has(project.level as SkillLevel),
    );
  }, [projects, selectedLevels]);

  // Gérer le toggle d'un niveau
  const toggleLevel = (level: SkillLevel) => {
    setSelectedLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  // Vider tous les filtres
  const clearAllFilters = () => {
    setSelectedLevels(new Set());
  };

  // Ouvrir le modal avec les détails du projet
  const openProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  // Fermer le modal
  const closeProjectDetails = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  if (projects === undefined) {
    return (
      <div className="flex h-full flex-col border-t">
        <div className="shrink-0 border-b px-4 py-2.5">
          <p className="text-sm font-medium">Projets pratiques</p>
          <p className="text-xs text-muted-foreground">
            Un projet par niveau, du débutant à l&apos;expert
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center px-4">
          <GeneratingIndicator label="Génération de vos projets..." />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex h-full flex-col border-t">
        <div className="shrink-0 border-b px-4 py-2.5">
          <p className="text-sm font-medium">Projets pratiques</p>
          <p className="text-xs text-muted-foreground">
            Un projet par niveau, du débutant à l&apos;expert
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">
            Aucun projet disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col border-t">
        {/* En-tête avec filtres */}
        <div className="shrink-0 border-b px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Projets pratiques</p>
              <p className="text-xs text-muted-foreground">
                {filteredProjects.length} projet
                {filteredProjects.length > 1 ? "s" : ""}
                {selectedLevels.size > 0 &&
                  ` · ${selectedLevels.size} niveau(x) sélectionné(s)`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Affichage des filtres actifs en badges */}
              {selectedLevels.size > 0 && (
                <div className="hidden items-center gap-1 sm:flex">
                  {Array.from(selectedLevels)
                    .slice(0, 3)
                    .map((level) => {
                      const styles = LEVEL_STYLES[level];
                      return (
                        <Badge
                          key={level}
                          variant="outline"
                          className={cn(
                            "h-5 px-2 py-0 text-[10px]",
                            styles.filterBadge,
                          )}
                        >
                          {level}
                          <button
                            onClick={() => toggleLevel(level)}
                            className="ml-1 hover:text-foreground"
                          >
                            <XIcon className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      );
                    })}
                  {selectedLevels.size > 3 && (
                    <Badge
                      variant="outline"
                      className="h-5 px-2 py-0 text-[10px]"
                    >
                      +{selectedLevels.size - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Bouton de filtre */}
              <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 text-xs",
                      selectedLevels.size > 0 &&
                        "border-primary/50 bg-primary/5",
                    )}
                  >
                    <FilterIcon className="h-3.5 w-3.5" />
                    Filtrer
                    {selectedLevels.size > 0 && (
                      <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                        {selectedLevels.size}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-0">
                  <LevelFilter
                    selectedLevels={selectedLevels}
                    onToggleLevel={toggleLevel}
                    onClearAll={clearAllFilters}
                  />
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Bouton clear sur mobile */}
              {selectedLevels.size > 0 && isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 px-2 text-xs"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Filtres actifs en badges sur mobile */}
          {selectedLevels.size > 0 && isMobile && (
            <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
              {Array.from(selectedLevels).map((level) => {
                const styles = LEVEL_STYLES[level];
                return (
                  <Badge
                    key={level}
                    variant="outline"
                    className={cn(
                      "h-5 px-2 py-0 text-[10px]",
                      styles.filterBadge,
                    )}
                  >
                    {level}
                    <button
                      onClick={() => toggleLevel(level)}
                      className="ml-1 hover:text-foreground"
                    >
                      <XIcon className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Grille des projets */}
        <div
          className={cn(
            "flex-1 overflow-y-auto p-4",
            isMobile ? "px-4" : "px-6",
          )}
        >
          {filteredProjects.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <p className="text-sm text-muted-foreground">
                Aucun projet pour les niveaux sélectionnés
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Voir tous les projets
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-4",
                isMobile
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
              )}
            >
              {filteredProjects.map((project) => {
                const level = project.level as SkillLevel;
                const styles = LEVEL_STYLES[level] || LEVEL_STYLES.Novice;

                return (
                  <div
                    key={project._id}
                    onClick={() => openProjectDetails(project)}
                    className={cn(
                      "flex flex-col gap-y-2 rounded-lg border p-4 transition-all duration-200",
                      styles.bg,
                      styles.border,
                      styles.cardBg,
                      "hover:shadow-md dark:hover:shadow-lg",
                      "hover:scale-[1.02] active:scale-[0.98]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-x-2">
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium",
                          styles.badge,
                          styles.badgeBorder,
                        )}
                      >
                        {project.level}
                      </span>
                      <div className="flex items-center gap-x-1.5">
                        {project.estimatedDuration && (
                          <span className="flex items-center gap-x-1 text-[10px] whitespace-nowrap text-muted-foreground">
                            <ClockIcon className="h-3 w-3" />
                            {project.estimatedDuration}
                          </span>
                        )}
                      </div>
                    </div>

                    {submissionsSummary?.[project._id] && (
                      <div className="flex items-center gap-x-2">
                        {submissionsSummary[project._id].passed && (
                          <span className="flex items-center gap-x-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                            <CheckCircle2Icon className="h-3 w-3" />
                            Réalisé
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {submissionsSummary[project._id].attempts} tentative
                          {submissionsSummary[project._id].attempts > 1
                            ? "s"
                            : ""}
                          {submissionsSummary[project._id].bestScore !== null &&
                            ` · meilleur score ${submissionsSummary[project._id].bestScore}/10`}
                        </span>
                      </div>
                    )}

                    <p className="line-clamp-2 text-sm leading-tight font-semibold">
                      {project.title}
                    </p>

                    <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>

                    {project.objectives.length > 0 && (
                      <div className="mt-auto flex flex-col gap-y-1 border-t border-border/50 pt-2">
                        <span className="flex items-center gap-x-1 text-[10px] font-medium text-muted-foreground">
                          <TargetIcon className="h-3 w-3" />
                          Objectifs
                        </span>
                        <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-muted-foreground">
                          {project.objectives
                            .slice(0, 3)
                            .map((objective, i) => (
                              <li key={i} className="line-clamp-1">
                                {objective}
                              </li>
                            ))}
                          {project.objectives.length > 3 && (
                            <li className="text-[10px] text-muted-foreground/70">
                              +{project.objectives.length - 3} autres objectifs
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Indicateur "Cliquez pour voir plus" */}
                    <div className="mt-1 text-center text-[10px] text-muted-foreground/50">
                      Cliquez pour voir les détails
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal des détails du projet */}
      <ProjectDetailModal
        roadmapId={roadmapId}
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeProjectDetails}
      />
    </>
  );
};
