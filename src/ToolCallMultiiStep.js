import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function getWeather(city) {
  const fakeData = {
    'Karachi': '34°C, sunny',
    'London': '14°C, rainy',
    'Tokyo': '22°C, cloudy',
  };
  return fakeData[city] || 'No data for that city';
}

function convertCurrency(amount, from, to) {
  const fakeRates = {
    'USD_EUR': 0.92,
    'USD_PKR': 278,
    'EUR_USD': 1.09,
    'PKR_USD': 0.0036,
  };
  const key = `${from}_${to}`;
  const rate = fakeRates[key];
  if (!rate) return `No rate available for ${from} to ${to}`;
  return `${amount} ${from} = ${(amount * rate).toFixed(2)} ${to}`;
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'getWeather',
      description: 'Get the current weather for a given city',
      parameters: {
        type: 'object',
        properties: { city: { type: 'string' } },
        required: ['city'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'convertCurrency',
      description: 'Convert an amount from one currency to another',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number' },
          from: { type: 'string' },
          to: { type: 'string' },
        },
        required: ['amount', 'from', 'to'],
      },
    },
  },
];

let messages = [
  {
    role: 'user',
    content: "Check the weather in Karachi. If it's above 30°C, convert 500 USD to PKR. If it's 30°C or below, convert 500 USD to EUR.",
  },
];

let stepCount = 0;
const MAX_STEPS = 1;

while (stepCount < MAX_STEPS) {
  stepCount++;
  console.log(`\n--- Step ${stepCount} ---`);

  const result = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages,
    tools,
  });

  const message = result.choices[0].message;
  messages.push(message);

  if (!message.tool_calls) {
    console.log('Final answer:', message.content);
    break;
  }

  for (const toolCall of message.tool_calls) {
    const args = JSON.parse(toolCall.function.arguments);
    console.log('Model called:', toolCall.function.name, args);

    let functionResult;
    if (toolCall.function.name === 'getWeather') {
      functionResult = getWeather(args.city);
    } else if (toolCall.function.name === 'convertCurrency') {
      functionResult = convertCurrency(args.amount, args.from, args.to);
    }

    console.log('Result:', functionResult);

    messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: functionResult,
    });
  }
}

if (stepCount >= MAX_STEPS) {
  console.log('\n⚠️ Hit max steps without a final answer — potential loop issue.');
}