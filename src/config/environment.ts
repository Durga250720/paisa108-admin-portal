
interface Environment {
  baseUrl: string;
  environment: 'dev' | 'stage' | 'production';
}

const environments: Record<string, Environment> = {
  dev: {
    baseUrl: 'https://api-dev.paisa108.com',
    environment: 'dev'
  },
  stage: {
    baseUrl: 'https://api-stage.paisa108.com',
    environment: 'stage'
  },
  production: {
    baseUrl: 'https://api.paisa108.com',
    environment: 'production'
  }
};

// Get current environment from process.env or default to dev
const currentEnv = import.meta.env.VITE_ENV || 'dev';

export const environment = environments[currentEnv] || environments.dev;
