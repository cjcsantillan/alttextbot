import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export interface AltTextBotConfig {
  apiKey: string;
  model?: string;
  maxLength?: number;
}

const DEFAULT_CONFIG_PATH = '.alttextbotrc.json';

export async function loadConfig(path = DEFAULT_CONFIG_PATH): Promise<Partial<AltTextBotConfig>> {
  if (!existsSync(path)) {
    return {};
  }
  const raw = await readFile(path, 'utf-8');
  return JSON.parse(raw) as Partial<AltTextBotConfig>;
}

export function resolveConfig(
  fileConfig: Partial<AltTextBotConfig>,
  env: NodeJS.ProcessEnv,
): AltTextBotConfig {
  const apiKey = fileConfig.apiKey ?? env.ALTTEXTBOT_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key: set ALTTEXTBOT_API_KEY or add "apiKey" to .alttextbotrc.json');
  }
  return {
    apiKey,
    model: fileConfig.model ?? env.ALTTEXTBOT_MODEL,
    maxLength: fileConfig.maxLength,
  };
}
