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
      sendResponse((result.choices[0].message.content));
      console.log((result.choices[0].message.content));
      chrome.runtime.sendMessage({
        name: 'message',
        data: result.choices[0].message.content
      });
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

// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   console.log('[ClauseGardian] Tab updated: ', tabId, info, tab);
//   if (!tab.url) return;
//   await chrome.sidePanel.setOptions({
//     tabId,
//     path: 'sidepanel.html',
//     enabled: true
//   });
//   }
// );