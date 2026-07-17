import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

async function callModel(messages, temperature = 1.0) {
  const chatCompletion = await groq.chat.completions.create({
    messages,
    model: MODEL,
    temperature,
  });

  return chatCompletion;
}

export { callModel };