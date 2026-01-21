# API Module Template

This template adapts based on project stack from `project-config.md`.

## TypeScript/JavaScript

```typescript
// {{api_name}}Api.ts

interface {{ApiName}}Config {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

interface ApiResponse<T> {
  status: 'success' | 'error' | 'degraded';
  source: 'api' | 'cache';
  data: T | null;
  error?: string;
}

export class {{ApiName}}Api {
  private config: {{ApiName}}Config;

  constructor(config: {{ApiName}}Config}) {
    this.config = config;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        return { status: 'error', source: 'api', data: null, error: response.statusText };
      }

      const data = await response.json();
      return { status: 'success', source: 'api', data };
    } catch (error) {
      return { status: 'error', source: 'api', data: null, error: String(error) };
    }
  }

  async getResource(id: string): Promise<ApiResponse<Resource>> {
    return this.request<Resource>('GET', `/resources/${id}`);
  }

  async createResource(data: CreateResourceInput): Promise<ApiResponse<Resource>> {
    return this.request<Resource>('POST', '/resources', {
      body: JSON.stringify(data),
    });
  }
}
```

## Python

```python
# {{api_name}}_api.py

from dataclasses import dataclass
from typing import TypeVar, Generic, Optional, Literal
import httpx

T = TypeVar('T')

@dataclass
class ApiResponse(Generic[T]):
    status: Literal['success', 'error', 'degraded']
    source: Literal['api', 'cache']
    data: Optional[T]
    error: Optional[str] = None

class {{ApiName}}Api:
    def __init__(self, base_url: str, api_key: str, timeout: int = 30):
        self.base_url = base_url
        self.api_key = api_key
        self.timeout = timeout
        self.client = httpx.Client(timeout=timeout)

    def _request(self, method: str, endpoint: str, **kwargs) -> ApiResponse:
        try:
            response = self.client.request(
                method,
                f"{self.base_url}{endpoint}",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                **kwargs
            )
            response.raise_for_status()
            return ApiResponse(status="success", source="api", data=response.json())
        except httpx.HTTPError as e:
            return ApiResponse(status="error", source="api", data=None, error=str(e))

    def get_resource(self, resource_id: str) -> ApiResponse:
        return self._request("GET", f"/resources/{resource_id}")

    def create_resource(self, data: dict) -> ApiResponse:
        return self._request("POST", "/resources", json=data)
```

## PHP

```php
<?php
// {{api_name}}_functions.php

/**
 * {{ApiName}} API - Authentication
 */
function api_{{api_name}}_authenticate(string $clientName): array {
    $config = get_client_config($clientName);
    // Implement auth logic
    return ['token' => $config['api_key']];
}

/**
 * {{ApiName}} API - GET with cache
 */
function api_{{api_name}}_get_resource(string $clientName, string $resourceId): array {
    $cacheKey = "{{api_name}}_resource_{$resourceId}";

    // Check cache first
    $cached = cache_get($cacheKey);
    if ($cached !== null) {
        return ['status' => 'success', 'source' => 'cache', 'data' => $cached];
    }

    // Call API
    $auth = api_{{api_name}}_authenticate($clientName);
    $response = http_get(
        "https://api.example.com/resources/{$resourceId}",
        ['headers' => ['Authorization' => "Bearer {$auth['token']}"]]
    );

    if ($response['status_code'] === 200) {
        cache_set($cacheKey, $response['data'], 3600);
        return ['status' => 'success', 'source' => 'api', 'data' => $response['data']];
    }

    return ['status' => 'error', 'source' => 'api', 'data' => null, 'error' => $response['error']];
}

/**
 * {{ApiName}} API - POST (no cache)
 */
function api_{{api_name}}_create_resource(string $clientName, array $data): array {
    $auth = api_{{api_name}}_authenticate($clientName);

    $response = http_post(
        "https://api.example.com/resources",
        [
            'headers' => ['Authorization' => "Bearer {$auth['token']}"],
            'body' => json_encode($data)
        ]
    );

    return [
        'status' => $response['status_code'] === 201 ? 'success' : 'error',
        'source' => 'api',
        'data' => $response['data'] ?? null
    ];
}
```

## Go

```go
// {{api_name}}_client.go

package api

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type {{ApiName}}Client struct {
    BaseURL    string
    APIKey     string
    HTTPClient *http.Client
}

type ApiResponse[T any] struct {
    Status string `json:"status"`
    Source string `json:"source"`
    Data   T      `json:"data"`
    Error  string `json:"error,omitempty"`
}

func New{{ApiName}}Client(baseURL, apiKey string) *{{ApiName}}Client {
    return &{{ApiName}}Client{
        BaseURL: baseURL,
        APIKey:  apiKey,
        HTTPClient: &http.Client{
            Timeout: 30 * time.Second,
        },
    }
}

func (c *{{ApiName}}Client) GetResource(id string) (*ApiResponse[Resource], error) {
    req, err := http.NewRequest("GET", fmt.Sprintf("%s/resources/%s", c.BaseURL, id), nil)
    if err != nil {
        return nil, err
    }

    req.Header.Set("Authorization", "Bearer "+c.APIKey)

    resp, err := c.HTTPClient.Do(req)
    if err != nil {
        return &ApiResponse[Resource]{Status: "error", Source: "api", Error: err.Error()}, nil
    }
    defer resp.Body.Close()

    var data Resource
    if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
        return &ApiResponse[Resource]{Status: "error", Source: "api", Error: err.Error()}, nil
    }

    return &ApiResponse[Resource]{Status: "success", Source: "api", Data: data}, nil
}
```
