let whatsappChromeExtensionContactName = '';
let isUnderMonitoring = false;

chrome.action.onClicked.addListener(async () => {
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  chrome.tabs.sendMessage(tab.id, 'START_TO_WATCH_ONLINE');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.message === 'SET_CONTACT_NAME_WATCHING') {
    isUnderMonitoring = true;
    whatsappChromeExtensionContactName = message.whatsappChromeExtensionContactName;
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
  if (message?.message != 'GET_CONTACT_NAME_BACKGORUND') {
    return;
  }
  sendResponse({
    whatsappChromeExtensionContactName,
    isUnderMonitoring,
    type: whatsappChromeExtensionContactName ? 'ok' : 'error',
  });
});