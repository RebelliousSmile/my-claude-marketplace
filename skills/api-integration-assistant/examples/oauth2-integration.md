# Example: OAuth2 API Integration

## Scenario

Integrate an API that uses OAuth2 Client Credentials flow with token refresh.

## Configuration

```env
API_CLIENT_ID=abc123
API_CLIENT_SECRET=secret456
API_BASE_URL=https://api.example.com
API_TOKEN_URL=https://api.example.com/oauth/token
```

## Implementation (TypeScript)

```typescript
// exampleApi.ts

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ApiConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  tokenUrl: string;
}

class ExampleApi {
  private config: ApiConfig;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async getToken(): Promise<string> {
    // Return cached token if still valid (with 5min buffer)
    if (this.token && Date.now() < this.tokenExpiry - 300000) {
      return this.token;
    }

    // Request new token
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data: TokenResponse = await response.json();
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);

    return this.token;
  }

  async request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    const token = await this.getToken();

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      // Token expired, clear and retry once
      this.token = null;
      const newToken = await this.getToken();

      const retryResponse = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!retryResponse.ok) {
        throw new Error(`API request failed: ${retryResponse.status}`);
      }

      return retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, body);
  }
}

// Usage
const api = new ExampleApi({
  clientId: process.env.API_CLIENT_ID!,
  clientSecret: process.env.API_CLIENT_SECRET!,
  baseUrl: process.env.API_BASE_URL!,
  tokenUrl: process.env.API_TOKEN_URL!,
});

const users = await api.get<User[]>('/users');
const newUser = await api.post<User>('/users', { name: 'John' });
```

## Test Contract

```typescript
// exampleApi.test.ts

describe('ExampleApi', () => {
  it('should authenticate and fetch data', async () => {
    const api = new ExampleApi(testConfig);
    const result = await api.get('/health');

    expect(result).toHaveProperty('status', 'ok');
  });

  it('should refresh token on 401', async () => {
    const api = new ExampleApi(testConfig);
    // Force token expiry
    api['tokenExpiry'] = 0;

    const result = await api.get('/users');
    expect(result).toBeDefined();
  });

  it('should handle rate limiting', async () => {
    const api = new ExampleApi(testConfig);

    // Make many requests
    const promises = Array(100).fill(null).map(() => api.get('/users'));

    await expect(Promise.all(promises)).resolves.toBeDefined();
  });
});
```
