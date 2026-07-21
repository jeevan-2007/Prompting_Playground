import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
  let dotProduct = 0, magnitudeA = 0, magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

const chunks = [
  "Employees are entitled to 18 days of paid annual leave per calendar year, accrued monthly.",
  "Remote work is permitted up to 3 days per week, subject to manager approval.",
  "The probation period for new hires is 90 days, during which either party may terminate with 1 week notice.",
  "Expense reimbursements must be submitted within 30 days with itemized receipts attached.",
  "Health insurance coverage begins on the first day of the month following the employee's start date.",
];

const question = "What's the dress code policy?";

// Embed all chunks, and the question
const chunkEmbeddings = await Promise.all(chunks.map(c => getEmbedding(c)));
const questionEmbedding = await getEmbedding(question);

// Score each chunk against the question
const scored = chunks.map((chunk, i) => ({
  chunk,
  score: cosineSimilarity(questionEmbedding, chunkEmbeddings[i]),
}));

scored.sort((a, b) => b.score - a.score);

console.log(`Question: "${question}"\n`);
scored.forEach((s, i) => {
  console.log(`${i + 1}. [${s.score.toFixed(4)}] ${s.chunk}`);
});

const topChunks = scored.slice(0, 2).map(s => s.chunk);

const prompt = `Answer the question using ONLY the context below. 
If the context does not contain enough information to answer confidently, say "I don't have enough information to answer that."
Do not use any outside knowledge.

Context:
${topChunks.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Question: ${question}`;

const result = await groq.chat.completions.create({
  messages: [{ role: 'user', content: prompt }],
  model: 'openai/gpt-oss-120b',
  temperature: 0.1,
});

console.log('\n--- Answer ---');
console.log(result.choices[0].message.content);