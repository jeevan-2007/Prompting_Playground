async function getEmbedding(text) {
  const response = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
  });
  const data = await response.json();
  return data.embedding;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

const documents = [
  "The chef added fresh basil and garlic to the simmering tomato sauce.",
  "Python's list comprehensions let you build arrays in a single readable line.",
  "The astronauts conducted a six-hour spacewalk to repair the solar panel array.",
  "A well-seasoned cast iron pan can last for generations if cared for properly.",
  "JavaScript's async/await syntax makes asynchronous code easier to read than callbacks.",
  "NASA's new telescope captured images of a galaxy over 13 billion light-years away.",
  "Kneading dough properly develops the gluten needed for a good bread structure.",
  "Git rebase rewrites commit history, while merge preserves it as a new commit.",
];

const query = "Outer Space?";

// Embed everything
const queryEmbedding = await getEmbedding(query);
const docEmbeddings = await Promise.all(documents.map(doc => getEmbedding(doc)));

// Score and rank
const results = documents.map((doc, i) => ({
  text: doc,
  score: cosineSimilarity(queryEmbedding, docEmbeddings[i]),
}));

results.sort((a, b) => b.score - a.score);

console.log(`Query: "${query}"\n`);
results.forEach((r, i) => {
  console.log(`${i + 1}. [${r.score.toFixed(4)}] ${r.text}`);
});