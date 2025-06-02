
export const environments = {
  development: {
    baseURL: 'https://dev-paisa108.tejsoft.com/'
  },
  staging: {
    baseURL: 'https://staging-api.paisa108.com/api'
  },
  production: {
    baseURL: 'https://api.paisa108.com/api'
  }
};

export const getEnvironment = () => {
  const env = import.meta.env.MODE || 'development';
  return environments[env as keyof typeof environments] || environments.development;
};

export const config = getEnvironment();
