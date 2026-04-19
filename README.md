# WebHook 🪝

<!-- Badges -->
[![npm version](https://badge.fury.io/js/webhook.svg)](https://badge.fury.io/js/webhook)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Downloads](https://img.shields.io/npm/dm/webhook.svg)](https://www.npmjs.com/package/webhook)

---

A lightweight, flexible, and type-safe webhook handler library for Node.js. WebHook makes it easy to register, trigger, and manage webhook endpoints with built-in retry logic, signature verification, and comprehensive event handling.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
  - [Basic Usage](#basic-usage)
  - [Multiple Handlers](#multiple-handlers)
  - [Async Handlers](#async-handlers)
  - [Error Handling](#error-handling)
  - [Retry Configuration](#retry-configuration)
  - [Signature Verification](#signature-verification)
  - [Event Filtering](#event-filtering)
  - [Full HTTP Integration](#full-http-integration)
- [API Reference](#api-reference)
  - [WebHook Class](#webhook-class)
  - [Options](#options)
  - [Events](#events)
- [Advanced Configuration](#advanced-configuration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### 🔧 Core Features

- **📝 Register** - Add webhook handlers with custom URL patterns and callback functions
- **🔄 Trigger** - Call registered webhooks with custom payload data
- **🔁 Retry** - Automatic retries with configurable backoff strategies
- **✅ Signatures** - Verify payloads using HMAC-SHA256 signatures
- **📊 Logging** - Built-in logging for debugging and monitoring
- **🎯 TypeScript** - Full TypeScript support with type definitions

### 🚀 Advanced Features

- **Multiple Handlers** - Register multiple handlers per endpoint
- **Async Support** - Handle async webhook operations seamlessly
- **Event Filtering** - Filter webhooks by event type
- **Priority Queue** - Process webhooks in priority order
- **Graceful Shutdown** - Handle process termination gracefully
- **Rate Limiting** - Built-in rate limiting to prevent overwhelming endpoints
- **Timeout Control** - Configurable timeouts for webhook requests
- **Dead Letter Queue** - Store failed webhooks for later retry

### 🛡️ Reliability

- **Automatic Retries** - Exponential backoff for failed deliveries
- **Circuit Breaker** - Prevent cascade failures with circuit breaker pattern
- **Idempotency** - Built-in idempotency support
- **Health Checks** - Monitor webhook endpoint health

---

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm, yarn, or pnpm

### Install via npm

```bash
npm install webhook
```

### Install via yarn

```bash
yarn add webhook
```

### Install via pnpm

```bash
pnpm add webhook
```

### TypeScript Configuration

No additional configuration needed! The package includes TypeScript definitions out of the box.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node"
  }
}
```

---

## Quick Start

Get up and running in seconds:

```typescript
import { WebHook } from 'webhook';

// Create a new WebHook instance
const hooks = new WebHook();

// Register a webhook handler
hooks.register('https://api.example.com/webhook', (data) => {
  console.log('Webhook received:', data);
});

// Trigger the webhook
await hooks.trigger('https://api.example.com/webhook', {
  event: 'user.created',
  data: {
    id: '123',
    email: 'user@example.com'
  }
});
```

---

## Usage Examples

### Basic Usage

The simplest way to use WebHook:

```typescript
import { WebHook } from 'webhook';

// Initialize
const hooks = new WebHook();

// Register a handler
hooks.register('https://example.com/hooks', (payload) => {
  console.log('Received:', payload);
});

// Trigger with data
await hooks.trigger('https://example.com/hooks', {
  type: 'notification',
  message: 'Hello, World!'
});
```

### Multiple Handlers

Register multiple handlers for the same or different endpoints:

```typescript
import { WebHook } from 'webhook';

const hooks = new WebHook();

// Register multiple handlers for the same endpoint
hooks.register('https://api.example.com/events', (data) => {
  console.log('Handler 1:', data);
});

hooks.register('https://api.example.com/events', (data) => {
  console.log('Handler 2:', data);
});

// Different endpoints work independently
hooks.register('https://api.example.com/orders', (data) => {
  console.log('Order received:', data);
});

// List all registered endpoints
console.log(hooks.list());
// Output: ['https://api.example.com/events', 'https://api.example.com/orders']
```

### Async Handlers

WebHook fully supports async handlers:

```typescript
import { WebHook } from 'webhook';

const hooks = new WebHook();

// Async handler example
hooks.register('https://api.example.com/process', async (data) => {
  // Simulate async operation
  await saveToDatabase(data);
  
  // Send notification
  await sendEmail(data.email);
  
  return { success: true };
});

// Async trigger
const result = await hooks.trigger('https://api.example.com/process', {
  action: 'user_signup',
  email: 'user@example.com'
});
```

### Error Handling

Proper error handling with try-catch:

```typescript
import { WebHook } from 'webhook';

const hooks = new WebHook();

// Register with error handling
hooks.register('https://api.example.com/webhook', (data) => {
  try {
    // Process the webhook
    processData(data);
  } catch (error) {
    console.error('Webhook processing failed:', error);
    // Optionally re-throw or handle gracefully
    throw error;
  }
});

// Trigger with error handling
try {
  await hooks.trigger('https://api.example.com/webhook', { test: true });
} catch (error) {
  console.error('Trigger failed:', error);
}
```

### Retry Configuration

Configure automatic retries for failed webhooks:

```typescript
import { WebHook } from 'webhook';

const hooks = new WebHook({
  retries: 3,
  retryDelay: 1000, // 1 second
  retryBackoff: true // Exponential backoff
});

// Custom retry options per trigger
await hooks.trigger('https://api.example.com/webhook', 
  { important: true },
  { retries: 5, retryDelay: 500 }
);
```

### Signature Verification

Verify webhook signatures for security:

```typescript
import { WebHook } from 'webhook';

const hooks = new WebHook({
  secret: 'your-webhook-secret'
});

// Register with signature verification
hooks.register('https://api.example.com/webhook', (data, headers) => {
  const signature = headers['x-webhook-signature'];
  
  // Verify signature
  if (!hooks.verifySignature(data, signature)) {
    throw new Error('Invalid signature');
  }
  
  console.log('Verified webhook:', data);
});

// Trigger with signature
await hooks.trigger('https://api.example.com/webhook', 
  { verified: true },
  { sign: true }
);
```

### Event Filtering

Filter webhooks by event type:

```typescript
import { WebHook } from 'webhook';

const hooks = new WebHook();

// Register event-specific handlers
hooks.register('https://api.example.com/webhook', (data) => {
  if (data.event === 'user.created') {
    console.log('New user:', data.user);
  } else if (data.event === 'user.deleted') {
    console.log('User deleted:', data.userId);
  }
});

// Trigger with event type
await hooks.trigger('https://api.example.com/webhook', {
  event: 'user.created',
  user: { id: '123', name: 'John Doe' }
});
```

### Full HTTP Integration

Complete example with HTTP server integration:

```typescript
import { WebHook } from 'webhook';
import express from 'express';

const app = express();
const hooks = new WebHook();

// Register webhooks
hooks.register('https://api.example.com/github', (data) => {
  console.log('GitHub webhook:', data);
});

hooks.register('https://api.example.com/stripe', (data) => {
  console.log('Stripe webhook:', data);
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const { url, payload, headers } = req.body;
    await hooks.trigger(url, payload, { headers });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## API Reference

### WebHook Class

#### Constructor

```typescript
new WebHook(options?: WebHookOptions)
```

Creates a new WebHook instance with optional configuration.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `options` | `WebHookOptions` | No | `{}` | Configuration options |

**Example:**

```typescript
const hooks = new WebHook({
  retries: 3,
  timeout: 5000,
  debug: true
});
```

#### Methods

##### `register(url: string, handler: Handler): void`

Registers a webhook handler for a specific URL.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | The webhook endpoint URL |
| `handler` | `Handler` | Yes | Callback function to handle webhook data |

**Returns:** `void`

**Example:**

```typescript
hooks.register('https://api.example.com/webhook', (data) => {
  console.log('Received:', data);
});
```

##### `trigger(url: string, data: any, options?: TriggerOptions): Promise<void>`

Triggers all handlers registered for a specific URL.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | The webhook endpoint URL |
| `data` | `any` | Yes | The payload data to send |
| `options` | `TriggerOptions` | No | Additional trigger options |

**Returns:** `Promise<void>`

**Example:**

```typescript
await hooks.trigger('https://api.example.com/webhook', {
  event: 'user.created',
  data: { id: '123' }
});
```

##### `list(): string[]`

Lists all registered webhook URLs.

**Returns:** `string[]` - Array of registered URLs

**Example:**

```typescript
const urls = hooks.list();
console.log('Registered webhooks:', urls);
```

##### `unregister(url: string): boolean`

Unregisters a webhook handler.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | The webhook URL to unregister |

**Returns:** `boolean` - True if unregistered, false if not found

**Example:**

```typescript
const removed = hooks.unregister('https://api.example.com/webhook');
console.log('Removed:', removed);
```

##### `verifySignature(data: any, signature: string): boolean`

Verifies a webhook signature.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | `any` | Yes | The payload data |
| `signature` | `string` | Yes | The signature to verify |

**Returns:** `boolean` - True if valid, false otherwise

**Example:**

```typescript
const isValid = hooks.verifySignature(payload, signature);
if (!isValid) {
  throw new Error('Invalid signature');
}
```

### Options

#### WebHookOptions

```typescript
interface WebHookOptions {
  retries?: number;
  retryDelay?: number;
  retryBackoff?: boolean;
  timeout?: number;
  secret?: string;
  debug?: boolean;
  logger?: Logger;
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `retries` | `number` | `3` | Number of retry attempts |
| `retryDelay` | `number` | `1000` | Initial delay between retries (ms) |
| `retryBackoff` | `boolean` | `true` | Use exponential backoff |
| `timeout` | `number` | `30000` | Request timeout (ms) |
| `secret` | `string` | - | Webhook secret for signing |
| `debug` | `boolean` | `false` | Enable debug logging |
| `logger` | `Logger` | `console` | Custom logger instance |

#### TriggerOptions

```typescript
interface TriggerOptions {
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  sign?: boolean;
  timeout?: number;
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `retries` | `number` | `options.retries` | Override retry count |
| `retryDelay` | `number` | `options.retryDelay` | Override retry delay |
| `headers` | `Record<string, string>` | `{}` | Custom headers |
| `sign` | `boolean` | `false` | Sign the payload |
| `timeout` | `number` | `options.timeout` | Override timeout |

### Events

WebHook supports event emission for monitoring:

```typescript
import { WebHook } from 'webhook';

const hooks = new WebHook();

hooks.on('trigger', (url, data) => {
  console.log('Triggered:', url);
});

hooks.on('success', (url, data) => {
  console.log('Success:', url);
});

hooks.on('error', (url, error) => {
  console.error('Error:', url, error);
});

hooks.on('retry', (url, attempt, error) => {
  console.log('Retrying:', url, 'attempt', attempt);
});
```

---

## Advanced Configuration

### Custom Logger

```typescript
import { WebHook } from 'webhook';
import pino from 'pino';

const logger = pino({ level: 'info' });

const hooks = new WebHook({
  logger,
  debug: true
});
```

### Circuit Breaker

```typescript
const hooks = new WebHook({
  circuitBreaker: {
    enabled: true,
    threshold: 5,
    timeout: 60000
  }
});
```

### Rate Limiting

```typescript
const hooks = new WebHook({
  rateLimit: {
    max: 100,
    window: 60000 // 1 minute
  }
});
```

---

## Best Practices

### 1. Always Verify Signatures

```typescript
hooks.register('https://api.example.com/webhook', (data, headers) => {
  if (!hooks.verifySignature(data, headers['x-signature'])) {
    throw new Error('Invalid signature');
  }
  // Process data
});
```

### 2. Use Async Handlers for Long Operations

```typescript
hooks.register('https://api.example.com/webhook', async (data) => {
  await saveToDatabase(data);
  await sendNotification(data);
  await updateAnalytics(data);
});
```

### 3. Implement Idempotency

```typescript
hooks.register('https://api.example.com/webhook', (data) => {
  const processed = cache.get(data.idempotencyKey);
  if (processed) return;
  
  processData(data);
  cache.set(data.idempotencyKey, true);
});
```

### 4. Set Appropriate Timeouts

```typescript
const hooks = new WebHook({
  timeout: 10000 // 10 seconds
});
```

### 5. Monitor and Log

```typescript
hooks.on('error', (url, error) => {
  monitoringService.logError(url, error);
});
```

---

## Troubleshooting

### Common Issues

#### Webhook not triggering

1. Check if URL is registered: `console.log(hooks.list())`
2. Verify URL spelling matches exactly
3. Check console for errors

#### Signature verification failing

1. Ensure secret is set in constructor
2. Check signature algorithm (HMAC-SHA256)
3. Verify timestamp is within tolerance

#### Retries not working

1. Check `retries` option is set
2. Verify error is being thrown correctly
3. Check retry delay settings

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- 📖 Documentation: [docs.example.com](https://docs.example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/example/webhook/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/example/webhook/discussions)

---

Made with ❤️ by the community
