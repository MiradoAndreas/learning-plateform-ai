type Summary = { bestScore: number | null; passed: boolean };

export function calculateProgress(
  orderedNodeIds: string[],
  completedNodeIds: string[],
  projectIds: string[],
  summaries: Record<string, Summary>,
  plannedProjectCount: number,
) {
  const nodes = new Set(orderedNodeIds);
  const completedQuizzes = [...new Set(completedNodeIds)].filter((id) =>
    nodes.has(id),
  ).length;
  const projects = [...new Set(projectIds)];
  const totalProjects = Math.max(projects.length, plannedProjectCount);
  const scores = projects.flatMap((id) => {
    const score = summaries[id]?.bestScore;
    return typeof score === "number" && Number.isFinite(score)
      ? [Math.max(0, Math.min(10, score))]
      : [];
  });
  const quizProgress = nodes.size ? (completedQuizzes / nodes.size) * 100 : 0;
  const projectProgress = totalProjects
    ? (scores.reduce((sum, score) => sum + score, 0) / (totalProjects * 10)) *
      100
    : 0;
  return {
    completedQuizzes,
    totalQuizzes: nodes.size,
    totalProjects,
    evaluatedProjects: scores.length,
    passedProjects: projects.filter((id) => summaries[id]?.passed).length,
    averageScore: scores.length
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : null,
    quizProgress,
    projectProgress,
    overallProgress: (quizProgress + projectProgress) / 2,
  };
}
