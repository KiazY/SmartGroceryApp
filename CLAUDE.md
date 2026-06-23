# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SmartGroceryApp — a React Native (Expo) grocery list app. The user types or dictates a free-text shopping request (e.g. "preciso de leite e 2 pacotes de natas") and an on-device LLM parses it into structured grocery items. The UI is in Portuguese (pt-PT).

## Commands

- `npm start` — start the Expo dev server
- `npm run android` — build and run on Android (`expo run:android`)
- `npm run ios` — build and run on iOS (`expo run:ios`)
- `npm run web` — run in a web browser

There is no test suite, lint config, or CI configured in this repo currently.

## Architecture

- **`App.tsx`** — single top-level component holding all app state (the grocery list, active/archive tab, model-loading progress). No navigation library or global state manager is used; everything lives here and is passed down via props.
- **`src/services/llm.ts`** — on-device inference via `llama.rn` (llama.cpp bindings). On first use it downloads a quantized Llama 3.2 1B Instruct GGUF model (`MODEL_URL`) into the app's document directory using `expo-file-system`, then loads it into a long-lived `LlamaContext` (`contextPromise`, created once and reused). `parseGroceryList(text)` sends the user's text plus a fixed Portuguese system prompt and few-shot examples to the model, constrained by a JSON schema (`RESPONSE_FORMAT`), and returns parsed `{ name, quantity }` items. Call `ensureModelReady()` early (done in `App.tsx`'s `useEffect`) so the model is downloaded/loaded before the first chat submission.
- **`src/services/storage.ts`** — persistence via `@react-native-async-storage/async-storage`. The full list (active + completed/archived items) is stored as one JSON blob under `@grocery_list`. `GroceryItem` extends `ParsedItem` (from `llm.ts`) with `id`, `completed`, and `completedAt`.
- **`src/components/ChatInput.tsx`** — text input + send button that triggers `onSubmit(text)`; disabled while loading or while the model isn't ready.
- **`src/components/GroceryItem.tsx`** — single list row with toggle-complete and delete actions.

### Data flow

1. User submits text via `ChatInput` → `App.handleSendPrompt`.
2. `parseGroceryList` (llm.ts) runs the on-device model and returns structured items.
3. New items are prepended to state and the full list is persisted via `saveGroceryList`.
4. The list is split client-side into "Por Comprar" (active, flat list) and "Arquivo" (completed items, grouped into `SectionList` sections by `completedAt` date, formatted `pt-PT`, newest day first).

### Notes specific to this codebase

- There is no remote backend or API — all parsing happens on-device; there is no network dependency at runtime once the model file is downloaded.
- `app.json` enables `newArchEnabled` and forces `buildReactNativeFromSource` on iOS (required for `llama.rn` native module compatibility) — be cautious changing Expo/RN versions without checking `llama.rn` compatibility.
- All user-facing strings (alerts, labels, placeholders) are in Portuguese — keep new UI copy consistent with that.
