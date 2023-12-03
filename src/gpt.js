import OpenAI from 'openai';
import { apiKey } from './key.js';

const openai = new OpenAI({
  dangerouslyAllowBrowser: true,
  apiKey, // defaults to process.env["OPENAI_API_KEY"]
});
export async function query(content) {
  return await openai.chat.completions.create({
    messages: [{ role: 'user', content }],
    model: 'gpt-3.5-turbo-16k',
  });
}