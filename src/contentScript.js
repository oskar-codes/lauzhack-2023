import { extractText, extractTextFromPage } from './extractTextFromPage.js';
import { query } from './gpt.js';

console.log('contentScript.js loaded');

async function findTermsAndConditionsLinksInPage() {
  const links = Array.from(document.getElementsByTagName('a'))
    .filter((a) => a.innerText.toLowerCase().includes('privacy') ||
                  a.innerText.toLowerCase().includes('term') || 
                  a.innerText.toLowerCase().includes('condition'));
  return links;
}

function setupCSS() {
  const css = document.createElement('style');
  css.innerHTML = `
    .terms-and-conditions-box {
      position: absolute;
      color: white;
      width: 500px;
      height: 0px;
      background-color: #111;
      z-index: 9999;
      transition: all 0.5s ease;
    }
  `;
  document.head.appendChild(css);
}

function addBoxContent(box) {
  const content = document.createElement('div');
  content.innerHTML = `
    <h1>Terms and Conditions</h1>
    <p>These are the terms and conditions</p>
  `;
  box.appendChild(content);
}

function createBox(link) {
  const box = document.createElement('div');
  box.style.position = 'absolute';
  box.style.top = `${link.offsetTop}px`;
  box.style.left = `${link.offsetLeft}px`;
  box.style.backgroundColor = '#111';
  box.style.opacity = '0';
  box.style.zIndex = '9999';
  box.classList.add('terms-and-conditions-box');

  console.log(link.offsetTop + 200, window.innerHeight);

  if (link.offsetTop + 200 > window.innerHeight) {
    box.style.top = `${window.innerHeight - 250}px`;
  }
  if (link.offsetLeft + 500 > window.innerWidth) {
    box.style.left = `${window.innerWidth - 550}px`;
  }

  addBoxContent(box);

  document.body.appendChild(box);

  setTimeout(() => {
    box.style.opacity = '1';
    box.style.height = '200px';
  }, 1);
}

async function start() {
  console.log("[ClauseGardian] Detected potential terms and conditions...");
  
  // const res = await isTermsAndConditionsPage();
  // if (!res) {
  //   console.log("[ClauseGardian] This is not a terms and conditions page.");
  //   return;
  // }

  // console.log("[ClauseGardian] Confirmed that this is a terms and conditions page.");

  // setupCSS();
  const links = await findTermsAndConditionsLinksInPage();
  console.log("[ClauseGardian] Found links: ", links);
  if (links.length === 0) {
    console.log("[ClauseGardian] No links found.");
    return;
  }
  const link = links[0];
  console.log("[ClauseGardian] Fetching page from link: ", link.href);
  const page = await chrome.runtime.sendMessage({
    type: 'fetch',
    payload: link.href
  });

  console.log("[ClauseGardian] Page fetched: ", page);

  const extracted = extractText(page).toLowerCase().trim();
  console.log("[ClauseGardian] Processing with GPT-3.5...");

  const payload = `
  For the following text, we will use this syntax
Text between quotation marks ("") should be considered as an example
Anything following "for example" is not an exhaustive list and should be considered indicative 
// should be interpreted as pseudocode

You are a bot summarizing a terms of service or privacy policies document for a user.
The text you will be given is fetched from a websites text content and can contain some lines of nonesense or random characters
They do however contain terms of service or privacy policies text contents somewhere.
You are to analyze only these parts of the text and summarize them for the user. 
The summary must be as concise as possible.
The total length must be under 30 lines. VERY IMPORTANT to be under 30 lines it should not excess it
Under no circumstances can you give a naive, useless and imprecise answer such as 
"These Terms serve as the entire agreement between you and Atlassian regarding the Cloud Products and related matters", 
instead if you come to this conclusion, start again and give more detail. 
Always try to analyze the text to its fullest and never, under any circumstances give 1 sentence answers such as 
"This document does not contain any useful information or problems."

Use authoritative language when summarize, for example :
say "You must be at least 18 years old to join."
and not "Says that users should be 18 years old to join"

Remove any part which do not provide useful information. 
Information is considered useful if it is concrete. 
For example : 
"WhatsApp may modify, suspend, or terminate services at any time, with or without notice, for various reasons, including maintenance, upgrades, or legal requirements." is useful and appropriately summarize a concrete concern.
while "WhatsApp emphasizes its commitment to privacy and security principles." or 
"Corporation emphasizes strong privacy and security principles" is abstract and does not inform the user of the content of the document, and thus is not useful and should absolutely not be included.
"This agreement outlines the terms of use for Amazon Services, including Amazon Software and Digital Content" 
gives no useful information, and is not written using authoritative language, and should not be included.

Highlight any problems it could have so he can check them out if need be.
A problem is something that can have negative consequences for the user that he should be aware of.
For example :
Automatic renewal of subscribtion is considered a problem that you should inform the user.
Account deletion after a certain period of inactivity or any other circumstances is also a problem that the user should be informed of.

FOLLOW THE FOLLOWING FORMATTING LAWS WHEN WRITING YOUR ANSWER:

Give which problem(s). If there aren't any problems, do not give anything. 
Try to be precise when explaining the problem, do not say for example : "The document contains legal language that may be hard for some users to understand."

Then give the number of problems.

Then summarize the information in small sections consisting of the document section title, followed by its summary (the useful information as defined before),
followed by problems for the user (problem as defined before). This is what we later refer to as content
It should always look like this:

document section title
- summary, only if there is any useful information in the section. Do not write anything if there isn't useful information
- problems, only if there are problems in this section. Do not write anything if there aren't problems
//if there there isn't a summary or problems, do not print the document section
//repeated as many times as necessary 

Do not make summaries which only consist of, for example: 
"The company's approach to data privacy is explained",
"Information about Netflix software and updates.", 
"Billing cycle details and payment methods are explained." 
or "Discusses the rights individuals may have regarding their personal information, including access, deletion, and correction, among others." 
as these do not provide any useful information.

For example, if summarizing a text consisting of sections : 
Licenses, Billing, Membership
And if you find that Licenses has no useful information and no problems,
Billing has useful information and no problems, and Membership has useful information and a problem, you should print:
"
Billing
-//summarized useful information*

Membership
-//summarized useful information*
-//clear concise explanation of the problem*
"
Notice that Billing does not have a section saying Problems : None, as it shouldn't be printed if there isn't a problem.
Notice also that Licenses has no useful information and no problems, and is thus not printed.

Do not give an introduction or a conclusion (such as a summary paragraph). Give only the content asked for.
I repeat, do not, under any circumstances give me a conclusion! This includes end paragraphs such as Note, PS, Remarks and others.

Under no circumstances can you give a naive, useless and imprecise answer such as 
"These Terms serve as the entire agreement between you and Atlassian regarding the Cloud Products and related matters", 
instead if you come to this conclusion, start again and give more detail. 
Always try to analyze the text to its fullest and never, under any circumstances give 1 sentence answers such as 
"This document does not contain any useful information or problems."

If you ever skip a line please use a <br> tag so that it can be interpreted correctly and not cause errors
The web page starts at ---.

---
  ` + extracted;

  console.log(payload);
  const analysis = await chrome.runtime.sendMessage({
    type: 'query',
    payload
  });
  console.log("[ClauseGardian] Analysis: ", analysis);
}

async function isTermsAndConditionsPage() {
  console.log("[ClauseGardian] Confirming whether this is a terms and conditions page");
  const payload = `
    You are a bot that has to know whether a web page requires the user to accept a privacy policy or not. A page on which there is a privacy policy or some other kind of terms of service but where it is nowhere written that i have to accept them or there is not any mechanism or implication that i should accept these terms specifically on this web page is not counted. For example here is a list web page that contains this kind of mechanism:
    << Create account terms agree google microsoft>>
    <<by clicking this button you accept the terms>>
    and here is a web page that does not contain any of such mechanisms
    <<create account terms and conditions privacy policy link>>
    <<agree with the chicken google account>>
    Please answer with specifically the following format:
    {
      isTermsAndConditionPage: Boolean
    }

    The web page starts at ---.

    ---
    ` + extractText(document.body.innerHTML);

  const result = await chrome.runtime.sendMessage({
    type: 'query',
    payload
  });
  return result.isTermsAndConditionPage; 
}

async function search() {
  console.log("[ClauseGardian] ClauseGardian searching...");
  const pageText = extractText(document.body.innerHTML).toLowerCase().trim();
  if ((pageText.includes('terms') ||
    pageText.includes('conditions')) &&
    (pageText.includes('agree') || pageText.includes('accept'))) {
    await start();
    return true;
  }
  return false;
}

(async () => {
  const trySearch = async () => {
    if (!(await search())) {
      setTimeout(trySearch, 1000);
    }
  }
  trySearch();
  // const result = await chrome.runtime.sendMessage({
  //   type: 'fetch',
  //   payload: 'https://help.instagram.com/581066165581870/?locale=fr_FR'
  // });
  // console.log(result);
})();