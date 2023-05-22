chrome.action.onClicked.addListener(async () => {
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  chrome.tabs.sendMessage(tab.id, 'START_TO_WATCH_ONLINE');

});