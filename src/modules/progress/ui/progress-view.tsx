"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ArrowRight, TrendingUp } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { SKILL_LEVELS } from "../../../../convex/roadmap/projects/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateProgress } from "../lib/calculate-progress";

const chartConfig = {
  progress: { label: "Progression (%)", color: "var(--chart-1)" },
} satisfies ChartConfig;

function LoadingProgress() {
  return (
    <div
      role="status"
      aria-label="Chargement de la progression"
      className="grid gap-6 md:grid-cols-2"
    >
      {[0, 1].map((key) => (
        <Skeleton key={key} className="h-96 w-full rounded-xl" />
      ))}
    </div>
  );
}

function RoadmapProgress({ roadmap }: { roadmap: Doc<"roadmaps"> }) {
  const progress = useQuery(api.roadmap.queries.getRoadmapProgress, {
    roadmapId: roadmap._id,
  });
  const projects = useQuery(api.roadmap.queries.getRoadmapProjects, {
    roadmapId: roadmap._id,
  });
  const summaries = useQuery(
    api.roadmap.submissions.queries.getSubmissionsSummaryByRoadmap,
    { roadmapId: roadmap._id },
  );
  const href = `/dashboard/ai/library/roadmap/${roadmap._id}`;

  if (!progress || !projects || !summaries)
    return (
      <Skeleton
        className="h-96 w-full rounded-xl"
        aria-label="Chargement de la roadmap"
      />
    );

  const result = calculateProgress(
    progress.orderedNodeIds,
    progress.completedNodeIds,
    projects.map((project) => project._id),
    summaries,
    SKILL_LEVELS.length,
  );
  const data = [
    { name: "Quiz", progress: Number(result.quizProgress.toFixed(1)) },
    { name: "Projets", progress: Number(result.projectProgress.toFixed(1)) },
  ];

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle>{roadmap.title ?? roadmap.topic}</CardTitle>
          <Badge variant="secondary">
            {result.overallProgress.toFixed(1)} %
          </Badge>
        </div>
        <CardDescription>
          Progression pondérée par les résultats des quiz et des projets.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ChartContainer
          config={chartConfig}
          className="h-48 w-full"
          aria-label={`Quiz : ${data[0].progress} %. Projets : ${data[1].progress} %.`}
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: -12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="progress" fill="var(--color-progress)" radius={6} />
          </BarChart>
        </ChartContainer>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Quiz réussis</dt>
            <dd>
              {result.completedQuizzes} / {result.totalQuizzes}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Projets évalués</dt>
            <dd>
              {result.evaluatedProjects} / {result.totalProjects}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Projets validés</dt>
            <dd>
              {result.passedProjects} / {result.totalProjects}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">
              Meilleures notes · moyenne
            </dt>
            <dd>
              {result.averageScore === null
                ? "Aucune évaluation"
                : `${result.averageScore.toFixed(1)} / 10`}
            </dd>
          </div>
        </dl>
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Les {SKILL_LEVELS.length} projets prévus seront disponibles dans
            votre roadmap.
          </p>
        )}
        {result.evaluatedProjects > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Évaluations par projet</p>
            {projects.map((project) => {
              const summary = summaries[project._id];
              if (summary?.bestScore == null) return null;
              return (
                <div
                  key={project._id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate">{project.title}</span>
                  <Badge variant={summary.passed ? "secondary" : "outline"}>
                    {summary.bestScore.toFixed(1)} / 10
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={href}>
            Continuer les quiz
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={`${href}/projects`}>Voir les projets</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ProgressView() {
  const { isAuthenticated } = useConvexAuth();
  const roadmaps = useQuery(
    api.roadmap.queries.listMyRoadmaps,
    isAuthenticated ? {} : "skip",
  );
  const ready = roadmaps?.filter(
    (roadmap) => roadmap.status === "completed" && roadmap.roadmapData,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Votre progression, roadmap par roadmap
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Chaque roadmap est suivie séparément : 50 % pour les quiz réussis, 50
          % pour les projets. Chaque projet contribue selon sa meilleure note
          sur 10 ; un projet non évalué compte pour zéro. Les nouvelles
          évaluations actualisent automatiquement vos résultats.
        </p>
      </div>
      {ready === undefined ? (
        <LoadingProgress />
      ) : ready.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TrendingUp />
            </EmptyMedia>
            <EmptyTitle>Aucune roadmap à suivre pour le moment</EmptyTitle>
            <EmptyDescription>
              Terminez la génération d’une roadmap pour suivre vos quiz et vos
              projets ici.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/dashboard/ai/library/roadmap">Mes roadmaps</Link>
          </Button>
        </Empty>
      ) : (
        <div className="grid items-stretch gap-6 xl:grid-cols-2">
          {ready.map((roadmap) => (
            <RoadmapProgress key={roadmap._id} roadmap={roadmap} />
          ))}
        </div>
      )}
    </div>
  );
}
