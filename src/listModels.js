const response = await fetch('http://localhost:11434/api/embeddings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'nomic-embed-text',
    prompt: 'The dog ran fast',
  }),
});

const data = await response.json();
console.log('Vector length:', data.embedding.length);
console.log('First 10 values:', data.embedding.slice(0, 10));