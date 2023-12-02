import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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', // defaults to process.env["OPENAI_API_KEY"]
});

async function test() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-4.0-turbo',
  });
  console.log(chatCompletion);
}

function findTermsAndConditionsLinksInPage() {

}

console.log(document.documentElement.outerHTML);