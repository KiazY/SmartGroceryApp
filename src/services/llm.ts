import { Directory, File, Paths } from 'expo-file-system';
import { initLlama, type LlamaContext } from 'llama.rn';

export interface ParsedItem {
  name: string;
  quantity: string;
}

const MODEL_FILENAME = 'Llama-3.2-1B-Instruct-Q4_K_M.gguf';
const MODEL_URL = `https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/${MODEL_FILENAME}`;

const modelsDir = new Directory(Paths.document, 'models');
const modelFile = new File(modelsDir, MODEL_FILENAME);

const SYSTEM_PROMPT = `Extrai a lista de produtos a comprar do texto do utilizador.
Devolve APENAS um array JSON, sem nenhum texto adicional antes ou depois.
Cada elemento do array tem exatamente duas propriedades:
- "name": o nome do produto, no singular, com a primeira letra em maiúscula.
- "quantity": a quantidade mencionada (incluindo a unidade, se houver), ou "1" se não for mencionada nenhuma quantidade.
Ignora frases introdutórias como "preciso de comprar" ou "quero" — extrai apenas os produtos.
Mantém os nomes dos produtos na língua em que o utilizador escreveu.`;

const FEW_SHOT: Array<{ role: 'user' | 'assistant'; content: string }> = [
  {
    role: 'user',
    content: 'Preciso de comprar 2 pacotes de natas, um quilo de farinha e mais uma dúzia de ovos',
  },
  {
    role: 'assistant',
    content: JSON.stringify([
      { name: 'Natas', quantity: '2 pacotes' },
      { name: 'Farinha', quantity: '1 quilo' },
      { name: 'Ovos', quantity: '1 dúzia' },
    ]),
  },
  { role: 'user', content: 'leite pão ovos queijo' },
  {
    role: 'assistant',
    content: JSON.stringify([
      { name: 'Leite', quantity: '1' },
      { name: 'Pão', quantity: '1' },
      { name: 'Ovos', quantity: '1' },
      { name: 'Queijo', quantity: '1' },
    ]),
  },
];

const RESPONSE_FORMAT = {
  type: 'json_schema' as const,
  json_schema: {
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'string' },
        },
        required: ['name', 'quantity'],
      },
    },
  },
};

let contextPromise: Promise<LlamaContext> | null = null;

async function downloadModel(onProgress?: (progress: number) => void): Promise<void> {
  if (!modelsDir.exists) {
    modelsDir.create({ intermediates: true });
  }

  await File.downloadFileAsync(MODEL_URL, modelFile, {
    idempotent: true,
    onProgress: ({ bytesWritten, totalBytes }) => {
      if (totalBytes > 0) {
        onProgress?.(bytesWritten / totalBytes);
      }
    },
  });
}

/**
 * Downloads the model on first use (if needed) and loads it into a llama.cpp
 * context. Safe to call multiple times — the context is created once and reused.
 */
export async function ensureModelReady(onProgress?: (progress: number) => void): Promise<void> {
  if (!contextPromise) {
    contextPromise = (async () => {
      if (!modelFile.exists) {
        await downloadModel(onProgress);
      }
      onProgress?.(1);
      return initLlama({
        model: modelFile.uri,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: 99,
      });
    })();
  }
  await contextPromise;
}

function extractJsonArray(text: string): unknown {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('A resposta do modelo não contém um array JSON.');
  }
  return JSON.parse(text.slice(start, end + 1));
}

function isParsedItem(value: unknown): value is ParsedItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ParsedItem).name === 'string' &&
    typeof (value as ParsedItem).quantity === 'string' &&
    (value as ParsedItem).name.trim().length > 0
  );
}

/**
 * Extracts grocery items from dictated/typed text using the on-device Llama 3.2 1B
 * model. Call ensureModelReady() first (e.g. on app start) so the model is
 * downloaded and loaded before the user's first request.
 */
export async function parseGroceryList(text: string): Promise<ParsedItem[]> {
  const cleaned = text.trim();
  if (!cleaned) return [];

  await ensureModelReady();
  const context = await contextPromise!;

  const result = await context.completion({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...FEW_SHOT,
      { role: 'user', content: cleaned },
    ],
    n_predict: 400,
    temperature: 0.2,
    response_format: RESPONSE_FORMAT,
  });

  const parsed = extractJsonArray(result.text);
  if (!Array.isArray(parsed)) {
    throw new Error('A resposta do modelo não é um array.');
  }

  return parsed.filter(isParsedItem);
}
