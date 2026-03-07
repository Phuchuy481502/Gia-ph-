# Giapha OS API - Code Examples

**Version:** 1.8.0  
**Last Updated:** March 7, 2026  
**Status:** Production Ready

Complete working examples for all API endpoints in multiple languages.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Incremental Sync](#incremental-sync)
3. [Push Notifications](#push-notifications)
4. [Advanced Examples](#advanced-examples)
5. [Error Handling](#error-handling)
6. [Real-World Scenarios](#real-world-scenarios)

---

## Authentication

### POST /api/v1/auth/login

Login with email and password to obtain JWT tokens.

#### cURL

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'

# Response (200 OK):
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "refresh_token": "refresh_token_550e8400e29b41d4...",
#   "expires_in": 3600,
#   "token_type": "Bearer",
#   "user_id": "550e8400-e29b-41d4-a716-446655440000",
#   "user_role": "member",
#   "user_email": "user@example.com",
#   "user_name": "John Doe"
# }
```

#### JavaScript/TypeScript

```typescript
// Using fetch API
async function login(email: string, password: string) {
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store tokens securely
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('expires_at', String(Date.now() + data.expires_in * 1000));
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Usage
const { access_token, refresh_token, user_role } = await login(
  'user@example.com',
  'securePassword123'
);
console.log(`Logged in as ${user_role}`);
```

#### Python

```python
import requests
import json
from typing import Dict, Any

def login(email: str, password: str) -> Dict[str, Any]:
    """
    Login with email and password to obtain JWT tokens.
    
    Args:
        email: User email address
        password: User password
        
    Returns:
        Dictionary containing access_token, refresh_token, and user info
        
    Raises:
        requests.exceptions.RequestException: If API request fails
        ValueError: If response is invalid
    """
    url = 'http://localhost:3000/api/v1/auth/login'
    
    payload = {
        'email': email,
        'password': password
    }
    
    try:
        response = requests.post(
            url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        response.raise_for_status()  # Raise exception for error status codes
        
        data = response.json()
        
        # Store tokens (in production, use secure storage)
        with open('.tokens', 'w') as f:
            json.dump({
                'access_token': data['access_token'],
                'refresh_token': data['refresh_token'],
                'expires_at': time.time() + data['expires_in']
            }, f)
        
        return data
        
    except requests.exceptions.HTTPError as e:
        error_detail = e.response.json()
        raise ValueError(f"Login failed: {error_detail.get('error', str(e))}")
    except requests.exceptions.RequestException as e:
        raise requests.exceptions.RequestException(f"Network error: {str(e)}")

# Usage
if __name__ == '__main__':
    try:
        result = login('user@example.com', 'securePassword123')
        print(f"Login successful! User role: {result['user_role']}")
        print(f"Access token: {result['access_token'][:20]}...")
    except Exception as e:
        print(f"Error: {e}")
```

#### React Native (Expo)

```typescript
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function loginUser(email: string, password: string) {
  try {
    const response = await fetch('https://api.giapha-os.app/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();

    // Store tokens securely
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);
    
    // Store non-sensitive data in AsyncStorage
    await AsyncStorage.setItem('user_info', JSON.stringify({
      id: data.user_id,
      email: data.user_email,
      name: data.user_name,
      role: data.user_role,
      expiresAt: Date.now() + data.expires_in * 1000
    }));

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Usage in React component
export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await loginUser(email, password);
      navigation.navigate('Home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
```

---

### POST /api/v1/auth/refresh

Refresh an expired access token using the refresh token.

#### cURL

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "refresh_token_550e8400e29b41d4..."
  }'

# Response (200 OK):
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "expires_in": 3600,
#   "token_type": "Bearer"
# }
```

#### TypeScript

```typescript
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch('http://localhost:3000/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  
  // Update stored token
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('expires_at', String(Date.now() + data.expires_in * 1000));
  
  return data.access_token;
}

// Utility: Refresh if token expires in next 5 minutes
async function ensureValidToken(accessToken: string, refreshToken: string): Promise<string> {
  const expiresAt = parseInt(localStorage.getItem('expires_at') || '0');
  const now = Date.now();
  
  // If expires in less than 5 minutes, refresh
  if (expiresAt - now < 5 * 60 * 1000) {
    return await refreshAccessToken(refreshToken);
  }
  
  return accessToken;
}
```

---

## Incremental Sync

### GET /api/v1/sync

Fetch all changes since a given timestamp (incremental sync).

#### Query Parameters

- `since` (required): ISO 8601 timestamp (e.g., `2026-03-01T00:00:00Z`)
- `branch_id` (optional): Filter to specific branch

#### cURL

```bash
# Get all changes since March 1, 2026
curl -X GET "http://localhost:3000/api/v1/sync?since=2026-03-01T00:00:00Z" \
  -H "Authorization: Bearer eyJhbGc..."

# Response (200 OK):
# {
#   "persons": [
#     {
#       "id": "person-001",
#       "name": "John Smith",
#       "is_public": false,
#       "updated_at": "2026-03-07T15:30:00Z",
#       "created_by": "user-001"
#     }
#   ],
#   "relationships": [],
#   "custom_events": [],
#   "timestamp": "2026-03-07T17:08:32.471Z",
#   "sync_count": 1,
#   "applied_filters": {
#     "role": "member",
#     "branch_id": "all"
#   }
# }
```

#### TypeScript with Offline-First Pattern

```typescript
import SQLite from 'react-native-sqlite-storage';

interface SyncableRecord {
  id: string;
  updated_at: string;
  [key: string]: any;
}

class OfflineFirstSync {
  private db: SQLite.Database;
  private lastSyncTime: string;
  private accessToken: string;

  constructor(db: SQLite.Database, lastSyncTime: string, accessToken: string) {
    this.db = db;
    this.lastSyncTime = lastSyncTime;
    this.accessToken = accessToken;
  }

  async syncPersons(): Promise<void> {
    try {
      // 1. Fetch changes from server
      const response = await fetch(
        `http://localhost:3000/api/v1/sync?since=${this.lastSyncTime}`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const { persons, timestamp } = await response.json();

      // 2. Apply changes to local database (last-write-wins)
      for (const person of persons) {
        const localVersion = await this.getLocalPerson(person.id);

        if (!localVersion || new Date(person.updated_at) > new Date(localVersion.updated_at)) {
          await this.upsertPerson(person);
        }
      }

      // 3. Upload local changes to server
      await this.uploadLocalChanges();

      // 4. Update sync timestamp
      await AsyncStorage.setItem('last_sync_time', timestamp);
      this.lastSyncTime = timestamp;

      console.log(`Synced ${persons.length} persons`);
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  private async getLocalPerson(id: string): Promise<SyncableRecord | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM persons WHERE id = ?',
          [id],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  private async upsertPerson(person: SyncableRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO persons (id, name, is_public, updated_at, created_by)
           VALUES (?, ?, ?, ?, ?)`,
          [person.id, person.name, person.is_public, person.updated_at, person.created_by],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  private async uploadLocalChanges(): Promise<void> {
    // Upload pending local changes to server
    // Implementation depends on your server's update endpoints
  }
}

// Usage
const db = await SQLite.openDatabase({ name: 'giapha.db', location: 'default' });
const lastSync = await AsyncStorage.getItem('last_sync_time');
const accessToken = await SecureStore.getItemAsync('access_token');

const syncer = new OfflineFirstSync(db, lastSync || '2000-01-01T00:00:00Z', accessToken);
await syncer.syncPersons();
```

#### Python

```python
import requests
import sqlite3
from datetime import datetime
from typing import List, Dict

class SyncManager:
    def __init__(self, db_path: str, access_token: str):
        self.db = sqlite3.connect(db_path)
        self.db.row_factory = sqlite3.Row  # Returns rows as dictionaries
        self.access_token = access_token
        self.api_url = 'http://localhost:3000/api/v1'

    def sync(self, since: str = '2000-01-01T00:00:00Z') -> None:
        """Perform incremental sync with server."""
        try:
            # 1. Fetch changes from server
            headers = {'Authorization': f'Bearer {self.access_token}'}
            params = {'since': since}
            
            response = requests.get(
                f'{self.api_url}/sync',
                headers=headers,
                params=params,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            # 2. Apply to local database
            cursor = self.db.cursor()
            
            for person in data.get('persons', []):
                cursor.execute('''
                    INSERT OR REPLACE INTO persons (id, name, is_public, updated_at)
                    VALUES (?, ?, ?, ?)
                ''', (person['id'], person['name'], person['is_public'], person['updated_at']))
            
            self.db.commit()
            
            print(f"Synced {len(data.get('persons', []))} persons")
            
        except requests.exceptions.RequestException as e:
            print(f"Sync error: {e}")
            raise

    def get_persons(self) -> List[Dict]:
        """Get all persons from local database."""
        cursor = self.db.cursor()
        cursor.execute('SELECT * FROM persons')
        return [dict(row) for row in cursor.fetchall()]

    def close(self):
        self.db.close()

# Usage
manager = SyncManager('giapha.db', 'your-access-token')
manager.sync(since='2026-03-01T00:00:00Z')
for person in manager.get_persons():
    print(person)
manager.close()
```

---

## Push Notifications

### POST /api/v1/notifications/tokens

Register a device for push notifications.

#### cURL

```bash
curl -X POST http://localhost:3000/api/v1/notifications/tokens \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ExponentPushToken[xxxxxx...]",
    "platform": "ios",
    "device_id": "device-uuid-12345"
  }'

# Response (201 Created):
# {
#   "id": "token-uuid-here",
#   "user_id": "user-001",
#   "token": "ExponentPushToken[xxxxxx...]",
#   "platform": "ios",
#   "device_id": "device-uuid-12345",
#   "is_active": true,
#   "created_at": "2026-03-07T17:08:32Z"
# }
```

#### React Native (Expo)

```typescript
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function registerForPushNotifications(accessToken: string) {
  try {
    // 1. Request notification permissions
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.log('Notification permission denied');
        return;
      }
    }

    // 2. Get Expo push token
    const projectId = 'abc123';  // From app.json
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('Push token:', token.data);

    // 3. Get device ID
    const deviceId = require('react-native').Platform.OS === 'ios'
      ? require('react-native-device-info').getUniqueId()
      : require('react-native-device-info').getAndroidId();

    // 4. Register with backend
    const response = await fetch('https://api.giapha-os.app/api/v1/notifications/tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token.data,
        platform: require('react-native').Platform.OS,
        device_id: deviceId
      })
    });

    if (response.ok) {
      const data = await response.json();
      await AsyncStorage.setItem('notification_token_id', data.id);
      console.log('Successfully registered for push notifications');
    } else {
      console.error('Failed to register for push notifications');
    }

    // 5. Set up notification handlers
    setupNotificationHandlers();
  } catch (error) {
    console.error('Error registering for push notifications:', error);
  }
}

function setupNotificationHandlers() {
  // Handle notifications when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      console.log('Notification received:', notification);
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
      };
    }
  });

  // Handle user tapping on notification
  Notifications.addNotificationResponseReceivedListener(response => {
    const { notification } = response;
    console.log('User tapped notification:', notification);
    // Navigate to relevant screen
  });
}

// Usage in app startup
export function useInitializeNotifications() {
  useEffect(() => {
    (async () => {
      const accessToken = await SecureStore.getItemAsync('access_token');
      if (accessToken) {
        await registerForPushNotifications(accessToken);
      }
    })();
  }, []);
}
```

---

## Advanced Examples

### Implementing Token Refresh Automatically

```typescript
// API client with automatic token refresh
class APIClient {
  private accessToken: string;
  private refreshToken: string;
  private baseURL = 'http://localhost:3000/api/v1';

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    const expiresAt = parseInt(localStorage.getItem('expires_at') || '0');
    
    // Refresh if expires in next 5 minutes
    if (Date.now() > expiresAt - 5 * 60 * 1000) {
      await this.refreshAccessToken();
    }
  }

  private async refreshAccessToken(): Promise<void> {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('expires_at', String(Date.now() + data.expires_in * 1000));
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    await this.refreshTokenIfNeeded();

    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    await this.refreshTokenIfNeeded();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }
}

// Usage
const client = new APIClient('access-token', 'refresh-token');
const syncData = await client.get('/sync', { since: '2026-03-01T00:00:00Z' });
```

### Offline-First Sync Queue

```typescript
interface PendingChange {
  id: string;
  type: 'person' | 'relationship' | 'event';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

class SyncQueue {
  private queue: PendingChange[] = [];
  private isProcessing = false;

  async addChange(change: PendingChange): Promise<void> {
    this.queue.push(change);
    // Sort by timestamp to maintain order
    this.queue.sort((a, b) => a.timestamp - b.timestamp);
    
    // Trigger processing if not already in progress
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const change = this.queue[0];

      try {
        await this.uploadChange(change);
        this.queue.shift(); // Remove from queue on success
      } catch (error) {
        console.error(`Failed to upload change:`, error);
        // Stop processing on error, retry later
        break;
      }
    }

    this.isProcessing = false;
  }

  private async uploadChange(change: PendingChange): Promise<void> {
    const endpoint = `/sync/changes`;
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(change)
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}

// Usage
const syncQueue = new SyncQueue();

// Add local changes to queue
await syncQueue.addChange({
  id: 'person-new-001',
  type: 'person',
  operation: 'create',
  data: { name: 'Jane Smith', is_public: false },
  timestamp: Date.now()
});

// Queue will process when connected
console.log(`Pending changes: ${syncQueue.getQueueSize()}`);
```

---

## Error Handling

### Common Error Codes and Handling

```typescript
interface APIError {
  status: number;
  error: string;
  code: string;
}

async function handleAPIResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const error: APIError = data;

    switch (response.status) {
      case 400:
        throw new ValidationError(`Invalid input: ${error.error}`);

      case 401:
        // Token expired or invalid - refresh and retry
        const newToken = await refreshAccessToken();
        throw new AuthenticationError(`Token invalid, refreshed. Retry request with new token.`);

      case 403:
        // Forbidden - could be account suspension or insufficient permissions
        if (error.code === 'ACCOUNT_SUSPENDED') {
          throw new AccountSuspendedError('Your account has been suspended.');
        } else {
          throw new PermissionError('You do not have permission for this action.');
        }

      case 404:
        throw new NotFoundError(`Resource not found: ${error.error}`);

      case 429:
        // Rate limited
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError(
          `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
          parseInt(retryAfter || '60')
        );

      case 500:
        throw new ServerError('Server error. Please try again later.');

      default:
        throw new APIError(response.status, error.error, error.code);
    }
  }

  return data;
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

class AccountSuspendedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountSuspendedError';
  }
}

class RateLimitError extends Error {
  constructor(message: string, public retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
  }
}

// Usage
try {
  const response = await fetch('/api/v1/sync?since=...');
  const data = await handleAPIResponse<SyncData>(response);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds.`);
    setTimeout(() => retry(), error.retryAfter * 1000);
  } else if (error instanceof AccountSuspendedError) {
    // Show account suspended message
  } else if (error instanceof AuthenticationError) {
    // Refresh token and retry
  }
}
```

---

## Real-World Scenarios

### Scenario 1: User Login with Biometric Auth (Mobile)

```typescript
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

async function loginWithBiometric() {
  try {
    // 1. Check if device supports biometrics
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      throw new Error('Device does not support biometric authentication');
    }

    // 2. Authenticate with biometrics
    const result = await LocalAuthentication.authenticateAsync({
      disableDeviceFallback: false,
      reason: 'Authenticate to access Giapha'
    });

    if (!result.success) {
      throw new Error('Biometric authentication failed');
    }

    // 3. Retrieve stored credentials from secure storage
    const email = await SecureStore.getItemAsync('stored_email');
    const passwordHash = await SecureStore.getItemAsync('stored_password_hash');

    if (!email || !passwordHash) {
      throw new Error('No stored credentials found');
    }

    // 4. Login with stored credentials
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password_hash: passwordHash
      })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    // 5. Store tokens
    const data = await response.json();
    await SecureStore.setItemAsync('access_token', data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.refresh_token);

    return data;
  } catch (error) {
    console.error('Biometric login failed:', error);
    throw error;
  }
}
```

### Scenario 2: Sync with Conflict Resolution

```typescript
interface SyncConflict {
  recordId: string;
  localVersion: any;
  serverVersion: any;
  localTimestamp: number;
  serverTimestamp: number;
}

async function handleSyncConflict(conflict: SyncConflict): Promise<'keep_local' | 'use_server'> {
  // Strategy: Last-write-wins
  if (conflict.localTimestamp > conflict.serverTimestamp) {
    return 'keep_local';
  } else {
    return 'use_server';
  }
}

async function syncWithConflictHandling(accessToken: string) {
  try {
    // 1. Get last sync time
    const lastSync = await AsyncStorage.getItem('last_sync_time') || '2000-01-01T00:00:00Z';

    // 2. Fetch changes from server
    const response = await fetch(`/api/v1/sync?since=${lastSync}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const { persons, timestamp } = await response.json();

    // 3. Apply changes with conflict detection
    for (const serverPerson of persons) {
      const localPerson = await getLocalPerson(serverPerson.id);

      if (localPerson) {
        const conflict: SyncConflict = {
          recordId: serverPerson.id,
          localVersion: localPerson,
          serverVersion: serverPerson,
          localTimestamp: new Date(localPerson.updated_at).getTime(),
          serverTimestamp: new Date(serverPerson.updated_at).getTime()
        };

        const resolution = await handleSyncConflict(conflict);

        if (resolution === 'keep_local') {
          // Keep local version, upload to server later
          console.log(`Keeping local version of ${serverPerson.id}`);
        } else {
          // Use server version
          await updateLocalPerson(serverPerson);
          console.log(`Updated ${serverPerson.id} with server version`);
        }
      } else {
        // New record, add it
        await insertLocalPerson(serverPerson);
      }
    }

    // 4. Update sync timestamp
    await AsyncStorage.setItem('last_sync_time', timestamp);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
```

### Scenario 3: Handling Rate Limits

```typescript
class RateLimitedAPIClient {
  private requestTimes: number[] = [];
  private readonly RATE_LIMIT = 100; // requests per hour
  private readonly WINDOW = 3600 * 1000; // 1 hour in ms

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    // 1. Check rate limit
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(t => now - t < this.WINDOW);

    if (this.requestTimes.length >= this.RATE_LIMIT) {
      const oldestRequest = Math.min(...this.requestTimes);
      const waitTime = this.WINDOW - (now - oldestRequest);
      
      console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Retry after wait
      return this.request(url, options);
    }

    // 2. Make request
    const response = await fetch(url, options);
    this.requestTimes.push(now);

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      console.log(`Rate limited. Retrying after ${retryAfter}s...`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return this.request(url, options);
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }
}

// Usage
const client = new RateLimitedAPIClient();
for (let i = 0; i < 150; i++) {
  await client.request('/api/v1/sync?since=...');
  console.log(`Request ${i + 1} completed`);
}
```

---

## References

- [Mobile API Reference](MOBILE_API_REFERENCE.md)
- [Backend Architecture](BACKEND_ARCHITECTURE.md)
- [Permission System](PERMISSION_SYSTEM_RECOMMENDATIONS.md)
- [JWT Best Practices](https://auth0.com/blog/json-web-token-jwt-best-current-practices/)

**Last Updated:** March 7, 2026  
**Version:** 1.0
