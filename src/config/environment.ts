
export const environments = {
  development: {
    baseURL: 'https://dev-paisa108.tejsoft.com/',
    componentImageUploading: {
      Version: 1.0,
      CredentialsProvider: {
        CognitoIdentity: {
          Default: {
            PoolId: 'us-east-1:d4bc770a-5664-4051-bd66-6861a6efbd9c',
            Region: 'us-east-1',
          },
        },
      },
      IdentityManager: {
        Default: {},
      },
      S3TransferUtility: {
        Default: {
          Bucket: 'dev-paisa108',
          Region: 'us-east-1',
        },
      },
    },
  },
  staging: {
    baseURL: 'https://staging-api.paisa108.com/api',
    componentImageUploading: {
      Version: 1.0,
      CredentialsProvider: {
        CognitoIdentity: {
          Default: {
            PoolId: 'us-east-1:d4bc770a-5664-4051-bd66-6861a6efbd9c',
            Region: 'us-east-1',
          },
        },
      },
      IdentityManager: {
        Default: {},
      },
      S3TransferUtility: {
        Default: {
          Bucket: 'dev-paisa108',
          Region: 'us-east-1',
        },
      },
    },
  },
  production: {
    baseURL: 'https://prod-paisa108.tejsoft.com/',
    componentImageUploading: {
      Version: 1.0,
      CredentialsProvider: {
        CognitoIdentity: {
          Default: {
            PoolId: 'ap-south-1:4458fb7e-0f2b-491a-9cc0-026ab8334088',
            Region: 'ap-south-1',
          },
        },
      },
      IdentityManager: {
        Default: {},
      },
      S3TransferUtility: {
        Default: {
          Bucket: 'prod-paisa108',
          Region: 'ap-south-1',
        },
      },
    },
  }
};

export const getEnvironment = () => {
  const env = import.meta.env.MODE || 'development';
  return environments[env as keyof typeof environments] || environments.development;
};

export const config = getEnvironment();
