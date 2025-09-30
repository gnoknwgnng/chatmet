# WhatsApp Soulmate Bot

A WhatsApp bot that chats with users like a real person (father, mother, or girlfriend) using AI.

## Features

- Connects to WhatsApp using whatsapp-web.js
- Uses Groq Cloud API for AI responses
- Stores user data and conversations in Supabase
- Supports multiple character modes (father, mother, girlfriend)
- Only responds to new numbers (not saved contacts)
- Can switch characters using `/switch` command

## Deployment to LeapCell

### Environment Variables

Set these environment variables in your LeapCell project:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
CHROMIUM_PATH=/usr/bin/chromium-browser
SESSION_DATA_PATH=./sessions/
PUPPETEER_SKIP_DOWNLOAD=true
```

### Supabase Setup

Create a `users` table in Supabase with this SQL:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  character VARCHAR(20),
  age VARCHAR(10),
  status VARCHAR(20),
  conversation JSONB DEFAULT '[]'::jsonb,
  step VARCHAR(50) DEFAULT 'start',
  created_at TIMESTAMP DEFAULT now()
);
```

### Build and Start Commands

- Build Command: `npm install`
- Start Command: `npm start` (or `node index.js`)

## Usage

1. After deployment, check the logs for the QR code
2. Scan the QR code with your phone to connect the bot to WhatsApp
3. New users can start chatting by sending "hi"
4. Users can switch characters anytime by sending "/switch"

## Character Modes

- **Father**: Caring and advisory, asks about studies and future
- **Mother**: Emotional and supportive, asks about health and feelings
- **Girlfriend**: Playful and flirty, casual conversation with emojis

## Development

To run locally:

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables
4. Run: `node index.js`
5. Scan the QR code that appears in the console