import { query } from './gpt.js';

console.log('background.js loaded');

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[ClauseGardian] Message received: ', request);
  if (request.type === 'query') {
    const { payload } = request;
    console.log('[ClauseGardian] Querying GPT-3.5');
    query(payload).then(result => {
      console.log('[ClauseGardian] GPT-3.5 response: ', result);
      sendResponse(JSON.parse(result.choices[0].message.content));
      console.log(JSON.parse(result.choices[0].message.content));
    });

    return true;
  } else if (request.type === 'fetch') {
    const { payload } = request;
    console.log('[ClauseGardian] Fetching: ', payload);
    fetch(payload).then(response => response.text()).then(text => {
      console.log(text);
      sendResponse(text);
    });
    return true;
  }
});