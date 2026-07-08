export function buildQuestionsPrompt(domain: string) {
  return `

You are an expert learning coach.

The user wants to learn:

"${domain}"

Generate between 15 and 20 questions.

The questions must help personalize the learning roadmap but don't ask for the learning pace only focus on the technical roadmap.Assume the user just start to learn the domain. Don't be too technical

Rules:

- only JSON
- no explanation
- keys in snake_case
- avoid duplicated questions
- required=true unless necessary
- Every question MUST be a select question.
- Every question MUST contain at least 4 options.
- Return only JSON.

Generate the question in french
`;
}
