import OpenAI from 'openai';


const openai = new OpenAI({
  dangerouslyAllowBrowser: true,
  apiKey: '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', // defaults to process.env["OPENAI_API_KEY"]
});
export async function query(content) {
  return await openai.chat.completions.create({
    messages: [{ role: 'user', content }],
    model: 'gpt-3.5-turbo-16k',
  });
}