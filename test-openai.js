import OpenAI from 'openai';

const openai = new OpenAI({
  dangerouslyAllowBrowser: true,
  apiKey: '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', // defaults to process.env["OPENAI_API_KEY"]
});

export async function query(content) {
  return await openai.chat.completions.create({
    messages: [{ role: 'user', content }],
    model: 'gpt-3.5-turbo',
  });
}

(async () => {
  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Hello, my name is Oskar.' },
      { role: 'assistant', content: 'Hello, Oskar. How are you?' },
      { role: 'user', content: 'Good. What is 1+1' },
      { role: 'assistant', content: '1 + 1 equals 2' },
      { role: 'user', content: 'What is my name?' }
    ],
    model: 'gpt-3.5-turbo-16k',
  });
  console.log(response.choices);
})();