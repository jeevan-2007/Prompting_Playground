# Prompting Playground

A small Node.js prompt playground organized into three stages. Stage 1 is a terminal chat experience with a Groq-hosted model, stage 2 is a structured extraction example, and stage 3 is a semantic search demo that uses a local Ollama embedding model because the Gemini and Groq APIs used here do not provide embedding endpoints.

## Project Structure

### Stage 1

- `src/index.js` - CLI entry point. It starts the readline prompt loop, collects the system prompt and temperature, sends messages to the model, and prints responses plus token usage.
- `src/callModel.js` - Groq client wrapper. It loads environment variables, creates the `Groq` SDK client, and sends chat completion requests.

### Stage 2

- `src/extract.js` - JSON extraction demo. It sends a fixed invoice-style text sample to the model, requests structured JSON output, parses the response, and validates the result with Zod.

### Stage 3

- `src/SemanticSearch.js` - Semantic search demo. It embeds a query and a set of documents with Ollama, scores them with cosine similarity, ranks the most relevant matches, and prints the ordered results.
- `package.json` - Project metadata, module type, and dependencies.
- `.env` - Local environment variables, including your Groq API key.

## Requirements

- Node.js 18 or newer
- A valid `GROQ_API_KEY`
- Ollama running locally on `http://localhost:11434` if you want to run stage 3

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root if you do not already have one:

```env
GROQ_API_KEY=your_groq_api_key_here
```

3. If you plan to run stage 3, make sure Ollama is installed and the `nomic-embed-text` model is available locally.

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

Run stage 2 with:

```bash
node src/extract.js
```

Run stage 3 with:

```bash
node src/SemanticSearch.js
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

### `src/extract.js`

This file is a structured extraction example. It takes a fixed block of messy invoice text, asks the model to return JSON with a specific schema, and then validates the parsed result with Zod.

Important behavior:

- `invoiceSchema` defines the expected shape: `vendor`, `amount`, `due_date`, and `priority`.
- The request uses `response_format: { type: 'json_object' }` and a low temperature to encourage machine-readable output.
- The prompt tells the model not to guess and to use `null` when a field is uncertain.
- The script still validates the parsed response after generation, because JSON mode does not guarantee factual accuracy.

### `src/SemanticSearch.js`

This file is the semantic search stage. It embeds a query and a document list using the local Ollama embeddings API, then ranks the documents by cosine similarity to surface the closest matches.

Important behavior:

- `getEmbedding(text)` sends a request to `http://localhost:11434/api/embeddings` using the `nomic-embed-text` model.
- `cosineSimilarity(vecA, vecB)` measures how similar two embeddings are by comparing their vector direction.
- The script embeds one query and several documents, scores each document, sorts the results, and prints the ranking.
- This stage uses Ollama because the Gemini and Groq APIs in this project do not offer embedding endpoints.

## Lesson Learned

Tested whether explicit prompt instructions ("use null if uncertain, do not guess") combined with low temperature (`0.1`) would stop the model from fabricating a due-date year not present in the source text. Result: the model consistently invented a year regardless. This confirms that JSON mode plus schema validation solve structural correctness valid syntax, correct types, allowed value sets but cannot solve factual correctness. The model can still produce confidently wrong data that passes every technical check. This is a core limitation that motivates retrieval-grounded approaches (RAG) over pure prompting for factual accuracy.

## Notes

- If `GROQ_API_KEY` is missing or invalid, the app will fail when it tries to call the Groq API.
- The project is configured as an ES module package through `"type": "module"` in `package.json`.
- `npm test` is not implemented yet; the current script is the default placeholder from `package.json`.
- Stage 3 depends on a local Ollama instance, not Gemini or Groq.
