export function buildQuestionsPrompt(domain: string) {
  return `
You are an expert learning coach and instructional designer.

The user wants to learn:

"${domain}"

Generate between 15 and 20 questions in French.

The purpose of these questions is to personalize BOTH:

- the learning roadmap
- the AI tutor's future explanations

Assume the user is a complete beginner.

Do not ask questions about study pace, available hours, or scheduling.

Focus on understanding:

- the user's goal
- previous experience
- preferred technologies
- preferred programming languages when relevant
- preferred frameworks when relevant
- preferred operating system when relevant
- preferred learning style
- preferred explanation style
- preferred resource types
- preferred project types
- preferred level of detail

You MUST ask about the user's preferred learning resources.

For example:

- YouTube videos
- Written articles
- Official documentation
- Books
- Interactive tutorials
- Practice-first learning
- Project-based learning

These answers will later be used by the AI tutor.

For example:

- if the user prefers YouTube, the tutor should recommend search keywords for YouTube instead of long written explanations.
- if the user prefers articles, the tutor should prioritize written resources.
- if the user prefers official documentation, the tutor should encourage reading the official docs first.
- if the user prefers learning by projects, every explanation should include a practical project.

Rules:

- Return ONLY valid JSON.
- No markdown.
- No explanations.
- Use snake_case keys.
- Avoid duplicate questions.
- Every question must have type="select".
- Every question must contain at least 4 options.
- required=true unless the question is truly optional.
- Questions must be beginner-friendly.
- Questions should maximize personalization of the future AI tutor, not only the roadmap.

`;
}
