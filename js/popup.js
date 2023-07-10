chrome.runtime.sendMessage({message: 'GET_CONTACT_NAME'}, msg => {
  if (!msg) {
    return;
  }
  const {type, message, whatsappChromeExtensionContactName, isUnderMonitoring} = msg;
  document.body.removeAttribute= 'class';
  if (type === 'ok') {
    document.body.setAttribute('class', 'status-error');
    if (isUnderMonitoring) {
      document.getElementById('contactName').innerHTML = whatsappChromeExtensionContactName;
    }
  };
  if (type === 'error') {
    document.getElementById('errorMessage').innerHTML = message;
  }
});