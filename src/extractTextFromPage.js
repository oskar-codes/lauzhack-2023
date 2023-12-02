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

function extractText(page) {

  return page.replace(/<script[^>]*>.+?<\/script>/g, '').replace(/<.+?>/g, ' ');
};
extractHTMLContent(targetURL)
    .then((htmlContent) => {
      if (htmlContent) {
        console.log(extractText(htmlContent));
      } else {
         console.log("err");
      }
    })
    .catch((error) => {
      console.error("err");
    });

export const extractTextFromPage = (url)=>{
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