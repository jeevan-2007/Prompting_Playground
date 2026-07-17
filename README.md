# Prompting Playground

A small Node.js prompt playground for chatting with a Groq-hosted model from the terminal. The app lets you set an optional system prompt, choose a temperature, and keep a running conversation in the same session.

## Project Structure

- `src/index.js` - CLI entry point. It starts the readline prompt loop, collects the system prompt and temperature, sends messages to the model, and prints responses plus token usage.
- `src/callModel.js` - Groq client wrapper. It loads environment variables, creates the `Groq` SDK client, and sends chat completion requests.
- `package.json` - Project metadata, module type, and dependencies.
- `.env` - Local environment variables, including your Groq API key.

## Requirements

- Node.js 18 or newer
- A valid `GROQ_API_KEY`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root if you do not already have one:

```env
GROQ_API_KEY=your_groq_api_key_here
```

## How It Works

When you run the app, it:

1. Opens an interactive terminal prompt.
2. Asks for an optional system prompt.
3. Asks for a temperature value between `0.0` and `2.0`.
4. Repeatedly accepts user messages until you type `exit`.
5. Sends the conversation history to the Groq chat completions API.
6. Prints the model response and token usage.

## Usage

Run the entry file directly with Node:

```bash
node src/index.js
```

Example session:

```text
Prompt Playground — type "exit" to quit.

System prompt (or press enter to skip): You are a concise assistant.
Temperature (0.0–2.0, default 1.0): 0.7

You: Write a haiku about rain.
Model: ...
[tokens: 24 in / 15 out / 39 total]
```

## File Details

### `src/index.js`

This file is the command-line interface. It imports `readline/promises` for interactive input and `callModel` for API calls. It keeps a `messages` array with the system message, then appends each user and assistant turn so the conversation has context.

Important behavior:

- The conversation exits when the user types `exit`.
- The default system prompt is `You are a helpful assistant.` if none is provided.
- Temperature input is parsed with `parseFloat`; if left blank, the default is `1.0`.
- The app expects the Groq response to include `choices[0].message.content` and `usage` fields.

### `src/callModel.js`

This file owns the Groq API integration. It imports `dotenv/config` so environment variables from `.env` are available, then creates a `Groq` client with `process.env.GROQ_API_KEY`.

Important behavior:

- The model is hard-coded as `llama-3.3-70b-versatile`.
- `callModel(messages, temperature)` sends the full conversation history to `groq.chat.completions.create()`.
- The function returns the raw completion response to the caller so the CLI can read both the generated text and token usage.

## Notes

- If `GROQ_API_KEY` is missing or invalid, the app will fail when it tries to call the Groq API.
- The project is configured as an ES module package through `"type": "module"` in `package.json`.
- `npm test` is not implemented yet; the current script is the default placeholder from `package.json`.
