# Vitala AI

An AI-powered mobile learning app that lets students chat with Gemini AI, generate flashcards and quizzes, summarize notes, ask questions about PDFs, and study in 5 languages.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `AI_INTEGRATIONS_GEMINI_BASE_URL`, `AI_INTEGRATIONS_GEMINI_API_KEY` — Gemini AI integration

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, Expo Router, React Native, @tanstack/react-query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: Google Gemini (`gemini-3-flash-preview`) via Replit AI Integrations proxy
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mobile/` — Expo React Native app
  - `app/(auth)/` — Onboarding, Login, Register screens
  - `app/(tabs)/` — Home, Chat list, Study, PDF AI, Profile tabs
  - `app/chat/[id].tsx` — Individual chat screen with SSE streaming
  - `app/study/flashcards.tsx` — AI flashcard generator
  - `app/study/quiz.tsx` — AI quiz generator
  - `components/` — ChatBubble, FlashCard, QuizCard, TypingIndicator, GradientHeader
  - `context/` — AuthContext (AsyncStorage-based), ThemeContext
  - `lib/i18n.ts` — Translations for EN, AM, OM, SW, AR
  - `services/stream.ts` — SSE streaming for chat
  - `constants/colors.ts` — Dark navy + teal/indigo brand colors
- `artifacts/api-server/` — Express API server
  - `src/routes/gemini/conversations.ts` — Chat CRUD + SSE streaming
  - `src/routes/gemini/study.ts` — Flashcards, Quiz, Summarize endpoints
  - `src/routes/gemini/pdf.ts` — PDF Q&A endpoint
- `lib/db/src/schema/` — conversations.ts + messages.ts tables
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/integrations-gemini-ai/` — Gemini AI client singleton

## Architecture decisions

- **Contract-first API**: OpenAPI spec → codegen → typed React Query hooks + Zod schemas.
- **SSE streaming**: Chat responses stream from Express via `text/event-stream`, consumed with `expo/fetch` reader on mobile.
- **Local auth**: Uses AsyncStorage to store user profile; no backend auth needed (simple learning app).
- **Gemini bundled**: `@google/genai` is NOT externalized in esbuild (removed `@google/*` from external list) so it bundles into the server binary.
- **Multilingual AI**: Backend passes `language` param to Gemini `systemInstruction` so responses match user preference.

## Product

- AI Chat: Create conversations, send messages, get streaming Gemini responses
- Flashcards: Enter any topic → AI generates 8 flashcards with flip animation
- Quiz: Enter any topic → AI generates 5 MCQ questions with scoring
- PDF AI: Pick a text/PDF file or paste text, ask questions about the content
- Profile: Change language (5 options), toggle dark/light/system theme
- Onboarding: 4-slide animated intro with skip support

## User preferences

- Dark-first design: deep navy (#080D1A) background, indigo (#7B7FFF) primary, teal (#00D4AA) accent
- 5 supported languages: English, Amharic, Afaan Oromo, Swahili, Arabic

## Gotchas

- **Never run `pnpm dev` at workspace root** — use workflow restart instead.
- **DB push required** after schema changes: `pnpm --filter @workspace/db run push`
- **Codegen required** after OpenAPI spec changes: `pnpm --filter @workspace/api-spec run codegen`
- `@google/genai` must NOT be in `build.mjs` externals (it's pure JS and must be bundled).
- Mobile uses `EXPO_PUBLIC_DOMAIN` env var (set in dev script) for API base URL.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
