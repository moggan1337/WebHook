# WebHook 🪝

**Webhook Handler** - Register, trigger, retry.

## Features

- **📝 Register** - Add webhook handlers
- **🔄 Trigger** - Call webhooks
- **🔁 Retry** - Automatic retries
- **✅ Signatures** - Verify payloads

## Installation

```bash
npm install webhook
```

## Usage

```typescript
import { WebHook } from 'webhook';

const hooks = new WebHook();

// Register
hooks.register('https://api.example.com/hook', (data) => {
  console.log('Webhook received:', data);
});

// Trigger
await hooks.trigger('https://api.example.com/hook', { event: 'user.created' });
```

## License

MIT
