# API Configuration Guide

This project uses Axios with JWT authentication to connect to a Spring Security backend running on `localhost:8080`.

## Configuration Files

### 1. Environment Variables (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 2. Axios Instance (`src/api/axios.ts`)
- Configured with base URL from environment variables
- Automatically adds JWT token to all requests
- Handles token refresh on 401 errors
- Redirects to login on authentication failure

### 3. Vite Proxy (`vite.config.ts`)
- Proxies `/api/*` requests to `http://localhost:8080`
- Prevents CORS issues during development

## Features

### JWT Token Management
- **Access Token**: Stored in `localStorage` as `access_token`
- **Refresh Token**: Stored in `localStorage` as `refresh_token`
- **Auto-refresh**: Automatically refreshes expired access tokens
- **Auto-redirect**: Redirects to `/login` when refresh fails

### Request Interceptor
Automatically adds `Authorization: Bearer <token>` header to all requests.

### Response Interceptor
- Detects 401 (Unauthorized) responses
- Attempts to refresh the access token
- Retries the original request with new token
- Queues multiple failed requests during refresh
- Clears tokens and redirects to login if refresh fails

## Usage Examples

### Authentication

```typescript
import { login, logout, register, getCurrentUser } from '@/api/authApi';

// Login
const loginUser = async () => {
  try {
    const response = await login({
      email: 'user@example.com',
      password: 'password123'
    });
    console.log('Logged in:', response.user);
    // Tokens are automatically stored
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Register
const registerUser = async () => {
  try {
    const user = await register({
      email: 'newuser@example.com',
      password: 'password123',
      name: 'John Doe',
      phone: '010-1234-5678',
      role: 'FREELANCER' // or 'EMPLOYER'
    });
    console.log('Registered:', user);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Get current user
const fetchCurrentUser = async () => {
  try {
    const user = await getCurrentUser();
    console.log('Current user:', user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }
};

// Logout
const logoutUser = async () => {
  await logout();
  // Tokens are automatically cleared
  // Redirect to login page
};
```

### Making API Calls

```typescript
import apiClient from '@/api/axios';

// GET request
const fetchData = async () => {
  try {
    const response = await apiClient.get('/api/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// POST request
const createData = async (data: any) => {
  try {
    const response = await apiClient.post('/api/users', data);
    return response.data;
  } catch (error) {
    console.error('Error creating data:', error);
    throw error;
  }
};

// PUT request
const updateData = async (id: number, data: any) => {
  try {
    const response = await apiClient.put(`/api/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
};

// DELETE request
const deleteData = async (id: number) => {
  try {
    await apiClient.delete(`/api/users/${id}`);
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
};
```

### Error Handling

```typescript
import apiClient from '@/api/axios';
import { AxiosError } from 'axios';

const handleApiCall = async () => {
  try {
    const response = await apiClient.get('/api/data');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response) {
        // Server responded with error status
        console.error('Server error:', error.response.status);
        console.error('Error data:', error.response.data);
      } else if (error.request) {
        // Request made but no response
        console.error('Network error:', error.request);
      } else {
        // Something else happened
        console.error('Error:', error.message);
      }
    }
    throw error;
  }
};
```

### Using with Vue 3 Composition API

```typescript
import { ref } from 'vue';
import apiClient from '@/api/axios';

const useUserData = () => {
  const userData = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchUser = async (userId: number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      userData.value = response.data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return {
    userData,
    loading,
    error,
    fetchUser
  };
};
```

### Using with TanStack Query (Vue Query)

```typescript
import { useQuery, useMutation } from '@tanstack/vue-query';
import apiClient from '@/api/axios';

// Query
const useUser = (userId: number) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data;
    }
  });
};

// Mutation
const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiClient.put(`/api/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      console.log('User updated successfully');
    }
  });
};
```

## Backend API Endpoints (Expected)

Based on Spring Security configuration, the following endpoints are expected:

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout (optional)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### Other Endpoints
All other endpoints should start with `/api/` and require authentication.

## Token Refresh Flow

1. User makes a request
2. Request fails with 401 (Unauthorized)
3. Axios interceptor catches the error
4. Interceptor sends refresh token to `/api/auth/refresh`
5. Backend returns new access token (and optionally new refresh token)
6. Interceptor updates stored tokens
7. Interceptor retries the original request with new token
8. If refresh fails, user is redirected to login

## Security Considerations

- Tokens are stored in `localStorage` (consider using `httpOnly` cookies for production)
- Always use HTTPS in production
- Set appropriate CORS configuration on backend
- Implement token expiration and rotation
- Consider implementing CSRF protection

## Development vs Production

### Development (`.env.development`)
```env
VITE_API_BASE_URL=http://localhost:8080
```

### Production (`.env.production`)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

The Vite proxy is only active in development mode and will not affect production builds.