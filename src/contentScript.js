import elementVisible from 'element-visible';
import { extractText, extractTextFromPage } from './extractTextFromPage.js';
import { query } from './gpt.js';

console.log('contentScript.js loaded');

function findTermsAndConditionsLinksInPage() {
  return Array.from(document.getElementsByTagName('a'))
    .filter(elementVisible)
    .filter((a) => a.innerText.toLowerCase().includes('term') || a.innerText.toLowerCase().includes('condition'))
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
  
  const res = await isTermsAndConditionsPage();
  if (!res) {
    console.log("[ClauseGardian] This is not a terms and conditions page.");
    return;
  }

  console.log("[ClauseGardian] Confirmed that this is a terms and conditions page.");

  setupCSS();
  const links = findTermsAndConditionsLinksInPage();

  console.log("[ClauseGardian] Found links: ", links);
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

function search() {
  console.log("[ClauseGardian] ClauseGardian searching...");
  const pageText = extractText(document.body.innerHTML).toLowerCase().trim();
  if ((pageText.includes('terms') ||
    pageText.includes('conditions')) &&
    (pageText.includes('agree') || pageText.includes('accept'))) {
    start();
    return true;
  }
  return false;
}

(async () => {
  const trySearch = () => {
    if (!search()) {
      setTimeout(trySearch, 1000);
    }
  }
  // trySearch();
  const result = await chrome.runtime.sendMessage({
    type: 'fetch',
    payload: 'https://help.instagram.com/581066165581870/?locale=fr_FR'
  });
  console.log(result);
})();