let whatsappChromeExtensionContactName = '';
let isUnderMonitoring = false;

chrome.action.onClicked.addListener(async () => {
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  chrome.tabs.sendMessage(tab.id, 'START_TO_WATCH_ONLINE');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.message === 'SET_CONTACT_NAME_WATCHING') {
    isUnderMonitoring = true;
    whatsappChromeExtensionContactName = message.payload;
    sendResponse(true);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.message === 'SET_CONTACT_NAME_OFF') {
    isUnderMonitoring = false;
    whatsappChromeExtensionContactName = '';
    sendResponse(true);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.message != 'GET_CONTACT_NAME_BACKGRORUND') {
    return;
  }
  sendResponse({
    whatsappChromeExtensionContactName,
    isUnderMonitoring,
    type: whatsappChromeExtensionContactName ? 'ok' : 'error',
  });
});