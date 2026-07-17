import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { callModel } from './callModel.js';

const rl = readline.createInterface({ input: stdin, output: stdout });

console.log('Prompt Playground — type "exit" to quit.\n');

const systemPrompt = await rl.question('System prompt (or press enter to skip): ');
const tempInput = await rl.question('Temperature (0.0–2.0, default 1.0): ');
const temperature = tempInput ? parseFloat(tempInput) : 1.0;

console.log('');

const messages = [
  { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
];

while (true) {
  const userPrompt = await rl.question('You: ');
  if (userPrompt.toLowerCase() === 'exit') break;
  messages.push({ role: 'user', content: userPrompt });

  const result = await callModel(messages, temperature);
  const text = result.choices[0].message.content;
  const usage = result.usage;

  messages.push({ role: 'assistant', content: text });
  console.log('\nModel:', text);
  console.log(`[tokens: ${usage.prompt_tokens} in / ${usage.completion_tokens} out / ${usage.total_tokens} total]\n`);
}

rl.close();