chrome.runtime.sendMessage({message:'GET_CONTACT_NAME'}, (whatsappChromeExtensionContactName) => {
  document.getElementById('contactName').innerHTML = (whatsappChromeExtensionContactName || 'No contact selected');
});
