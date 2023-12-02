const targetURL = 'https://openai.com/policies/terms-of-use';

async function extractHTMLContent(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const htmlContent = await response.text();
    return htmlContent;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

function extractText(s) {
  let pageContent = '';
  let nCurlyBraces = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '<') {
      while (s[i] !== '>') {
        i++;
      }
      pageContent += ' ';
    } else if (s[i] === '{') {
      nCurlyBraces++;
      while (nCurlyBraces > 0) {
        i++
        console.log(nCurlyBraces);
        if (s[i] === '{') {
          nCurlyBraces++;
        } else if (s[i] === '}') {
          nCurlyBraces--;
        }
      }
      pageContent += ' ';
    } else {
      pageContent += s[i];
    }
  }
  return pageContent;
};

export function extractTextFromPage(url) {
  return extractHTMLContent(url)
    .then((htmlContent) => {
      if (htmlContent) {
        return extractText(htmlContent);
      } else {
        return null;
      }
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
}