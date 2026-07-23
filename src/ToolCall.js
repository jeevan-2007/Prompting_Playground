import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Fake function - hardcoded, no real API call yet
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
// Tell the model this function exists and how to use it
const tools = [
  {
    type: 'function',
    function: {
      name: 'getWeather',
      description: 'Get the current weather for a given city',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'The city name, e.g. London' },
        },
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
                amount: { type: 'number', description: 'The amount to convert' },
                fromCurrency: { type: 'string', description: 'The currency code to convert from, e.g. USD' },
                toCurrency: { type: 'string', description: 'The currency code to convert to, e.g. EUR' },
            },
            required: ['amount', 'fromCurrency', 'toCurrency'],
        },
    },
},
];

const userQuestion = "If I have 500 US dollars, how much is that in Pakistani rupees?";

const result = await groq.chat.completions.create({
  model: 'openai/gpt-oss-120b',
  messages: [{ role: 'user', content: userQuestion }],
  tools,
});

console.log(JSON.stringify(result.choices[0].message, null, 2));
const message = result.choices[0].message;
if (message.tool_calls){
    const toolCall = message.tool_calls[0];
    console.log('toolCall:', JSON.stringify(toolCall, null, 2));
    const args = JSON.parse(toolCall.function.arguments);

    const funcResult = convertCurrency(args.amount, args.fromCurrency, args.toCurrency) || getWeather(args.city);

     console.log('Model wants to call:', toolCall.function.name, 'with', args);
  console.log('Function result:', funcResult);

  // Send the result back so the model can finish answering
  const followUp = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'user', content: userQuestion },
      message, // the model's tool_call request
      {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: funcResult,
      },
    ],
    tools,
  });

  console.log('\nFinal answer:', followUp.choices[0].message.content);



}