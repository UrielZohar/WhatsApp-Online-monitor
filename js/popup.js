chrome.tabs.query({active: true, currentWindow: true}, async tabs => {
  const isOnWhatsAppWeb = tabs[0].url.includes('web.whatsapp.com');
  let res;
  if (isOnWhatsAppWeb) {
    res = await chrome.tabs.sendMessage(tabs[0].id, {message: 'GET_CONTACT_NAME_CONTENT'});
  } else {
    res = await chrome.runtime.sendMessage({message: 'GET_CONTACT_NAME_BACKGORUND'})
  }
  if (!res) {
    return;
  }
  const {type, message, whatsappChromeExtensionContactName, isUnderMonitoring} = res;
  if (type === 'ok') {
    if (isUnderMonitoring) {
      document.body.setAttribute('class', 'status-ok');
      document.getElementById('contactName').innerHTML = whatsappChromeExtensionContactName;
    } else {
      document.body.setAttribute('class', 'status-deady-to-use');
      document.getElementById('buttonContactName').innerHTML = whatsappChromeExtensionContactName;
    }
  };
  if (type === 'error') {
    document.body.setAttribute('class', 'status-error');
    document.getElementById('errorMessage').innerHTML = 'No contact selected';
  }
});

const startMonitoring = async () => {
  const tabs = await chrome.tabs.query({active: true, currentWindow: true});
  const { whatsappChromeExtensionContactName } = await chrome.tabs.sendMessage(tabs[0].id, {message: 'START_TO_WATCH_ONLINE'});
  document.body.setAttribute('class', 'status-ok');
  document.getElementById('contactName').innerHTML = whatsappChromeExtensionContactName;
}

document.querySelector('.button-title-button').addEventListener('click', startMonitoring);