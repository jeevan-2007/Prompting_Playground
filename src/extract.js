import 'dotenv/config';
import Groq from 'groq-sdk';
import {z} from 'zod';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

const invoiceSchema = z.object({
    vendor: z.string(),
    amount: z.number().positive(),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(), // YYYY-MM-DD format
    priority: z.enum(['low', 'medium', 'high']),

})

const messyText = `
Hey team, just a heads up - John from accounting mentioned the Q3 invoice 
for $4,250 from Skyline Supplies is overdue. It was due March 15th but 
we still haven't paid it. Priority is high since they're threatening to 
pause our account.
`;

const prompt = `Extract the following fields as a JSON object with EXACTLY these keys and nothing else:
- vendor (string)
- amount (number, no currency symbols)
- due_date (string, format YYYY-MM-DD — convert any date you find into this format)
- priority (must be exactly one of: "low", "medium", "high")

If any field cannot be determined from the text with certainty, use null instead of guessing.
Do NOT infer or add information that is not explicitly stated in the text.

Text: ${messyText}`;
const result = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model:MODEL,
    response_format: {
        type: 'json_object'
    },
    temperature: 0.1
});

const raw = result.choices[0].message.content;
const parsed = JSON.parse(raw);
const validation = invoiceSchema.safeParse(parsed);
if (!validation.success) {
    console.error('Validation failed:', validation.error);
} else {
    console.log('Extracted invoice:', validation.data);
}
