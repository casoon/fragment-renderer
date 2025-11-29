# Email Demo

This demo shows how to render Astro components as email templates.

## Features

- Email template rendering
- Email-safe HTML layout
- Provider-specific optimizations

## Installation

```bash
npm install
```

## Usage

### Render Email

```bash
node render-email.js
```

### Start Preview Server

```bash
node preview-server.js
# Open http://localhost:3000
```

## Example

```typescript
import { createAstroRuntime } from '@skibidoo/container-runtime';
import { emailPreset } from '@skibidoo/container-runtime/presets/email';
import WelcomeEmail from './templates/WelcomeEmail.astro';

const preset = emailPreset({ provider: 'sendgrid' });
const runtime = createAstroRuntime({
  baseContext: preset.baseContext,
  services: preset.services,
});

const html = await runtime.renderComponent(WelcomeEmail, {
  userName: 'John Doe',
  activationLink: 'https://example.com/activate/abc123',
});

// Send HTML to email provider
await sendEmail({
  to: 'john@example.com',
  subject: 'Welcome!',
  html,
});
```
