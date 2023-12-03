import { query } from './src/gpt.js';

const result = await query('What is the meaning of life?');

console.log(result);

console.log(result.choices[0].message);