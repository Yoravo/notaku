import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export default {
  // The endpoint serves the model id over the OpenAI chat API; pass apiKey when it needs one.
  agents: {
    default: {
      model: createOpenAICompatible({
        name: 'openai-compatible',
        baseURL: 'http://localhost:20128/v1',
        // apiKey: process.env.LLM_API_KEY,
      }).chatModel('gpt-6-luna'),
      system: 'You are a thorough QA agent. Verify every outcome.',
    },
  },
  // Diisi per-run via E2E_USER_ADMIN_USERNAME / E2E_USER_ADMIN_PASSWORD. Jangan commit password.
  credentials: {
    admin: {
      username: 'admin@example.test',
      password: () => '',
    },
  },
  targets: [{
    engine: web(),
    app: {
      url: process.env.APP_URL ?? 'http://localhost:3000',
      // Or let the runner start the dev server:
      // command: { executable: 'npm', args: ['run', 'dev'] },
    },
  }],
} satisfies E2EConfig;
