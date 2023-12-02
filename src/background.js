console.log('background.js loaded');

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
});