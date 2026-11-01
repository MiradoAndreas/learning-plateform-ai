---
name: convex-dev-rag
description: Retrieval-Augmented Generation (RAG) for use with your AI products and Agents Use this skill whenever working with RAG or related Convex component functionality.
version: 0.7.8
---

> Agents: read this skill fully before writing code that uses RAG. Follow the installation and configuration steps exactly.

# RAG

## Instructions

A semantic search component that implements Retrieval-Augmented Generation (RAG) for AI applications. It automatically chunks text content, generates embeddings using AI SDK models, and provides vector-based similarity search across namespaced content. Includes features like custom filtering, importance weighting, chunk context expansion, and graceful content migration for production RAG workflows.

### Installation

```bash
npm install @convex-dev/rag
```

Current npm version: `@convex-dev/rag@0.7.8`

## Use cases

- **Building AI chatbots** that need to search through documentation, knowledge bases, or user-specific content to provide contextual responses
- **Creating document Q&A systems** where users upload files and ask questions that require semantic search across the content with proper context
- **Implementing multi-tenant RAG** where different users or organizations need isolated search namespaces with custom filtering by document type, category, or metadata
- **Adding semantic search to existing apps** that need to surface relevant content based on user queries rather than exact keyword matches
- **Building AI agents** that need to retrieve and synthesize information from large content repositories before generating responses

## How it works

The component integrates with your Convex app through the standard component pattern, requiring a `convex.config.ts` setup and creating a RAG instance with your chosen embedding model from AI SDK. Content is added via the `add()` method which automatically chunks text and generates embeddings, organizing everything into namespaces for isolation.

Search operates through the `search()` method which performs vector similarity matching and returns results with configurable score thresholds, chunk context expansion, and custom filtering. The component handles the complexity of embedding generation, vector storage, and result formatting, providing both raw results and formatted text ready for LLM consumption.

For full RAG workflows, the `generateText()` method combines search and LLM generation in one call, automatically retrieving relevant context and formatting it for the language model. The component supports graceful content replacement using keys, allowing you to update documents without disrupting active searches.

## When NOT to use

- When a simpler built-in solution exists for your specific use case
- If you are not using Convex as your backend
- When the functionality provided by RAG is not needed

## Resources

- [npm package](https://www.npmjs.com/package/%40convex-dev%2Frag)
- [GitHub repository](https://github.com/get-convex/rag)
- [Convex Components Directory](https://www.convex.dev/components/rag)
- [Convex documentation](https://docs.convex.dev)