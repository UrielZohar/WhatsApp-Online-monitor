let whatsappChromeExtensionOnlineObserver = null;
let whatsappChromeExtensionContactName = null;
let isUnderMonitoring = false;

const startWatching = (whatsappChromeExtensionContactName) => {
  isUnderMonitoring = true;
  chrome.runtime.sendMessage({
    message: 'SET_CONTACT_NAME_WATCHING',
    whatsappChromeExtensionContactName
  });
};

const stopWatching = () => {
  isUnderMonitoring = false;
  chrome.runtime.sendMessage({
    message: 'SET_CONTACT_NAME_OFF',
  });
};

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {

  if (msg.message !== 'GET_CONTACT_NAME_CONTENT') {
    sendResponse({whatsappChromeExtensionContactName});
    return;
  }
  const mainElement = document.querySelector('#app');
  whatsappChromeExtensionContactName = mainElement
    .querySelector('span[data-testid="conversation-info-header-chat-title"]')
    ?.innerHTML;
  if (whatsappChromeExtensionContactName) {
    sendResponse({
      type: 'ok',
      whatsappChromeExtensionContactName,
      isUnderMonitoring,
    });
  } else {
    sendResponse({
      type: 'error',
      message: 'No contact selected',
    });
  }
});

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.message != 'START_TO_WATCH_ONLINE') {
    return;
  }

  if (!("Notification" in window)) {
    // Check if the browser supports notifications
    alert("This browser does not support desktop notification");
  }

  if (Notification.permission !== "denied") {
    // We need to ask the user for permission
    const permission = await Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      if (permission !== "granted") {
        alert("Please approve the desktop notification for WhatsApp Web");
        return;
      }
    });
  }

  const mainElement = document.querySelector('#app');
  const profilePicSrc = mainElement.querySelector('div[title="Profile Details"] img')?.src;
  whatsappChromeExtensionContactName = mainElement
      .querySelector('span[data-testid="conversation-info-header-chat-title"]')
      ?.innerHTML;

  if (!whatsappChromeExtensionContactName) {
    return;
  }

  // notify background.js about the contact name
  startWatching(whatsappChromeExtensionContactName);

  const notificationConfig = [
    'Online 🟢',
    {
      body: `${whatsappChromeExtensionContactName} is online now`,
      icon: profilePicSrc,
    }
  ];

  if (whatsappChromeExtensionOnlineObserver) {
    whatsappChromeExtensionOnlineObserver.disconnect();
  }
  
  const isOnline = !!mainElement.querySelector('span[title="online"]');

  if (isOnline) {
    new Notification(...notificationConfig);
    stopWatching();
    return;
  }
  
  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    const isOnline = !!mainElement.querySelector('span[title="online"]');
    const currentContactName = mainElement
      .querySelector('span[data-testid="conversation-info-header-chat-title"]')
      .innerHTML;

    if (currentContactName !== whatsappChromeExtensionContactName) {
      new Notification('🔎❌', {
        body: `Stopped monitoring ${whatsappChromeExtensionContactName}`,
        icon: profilePicSrc,
      });
      observer.disconnect();
      stopWatching();
      return;
    }

    if (isOnline) {
      new Notification(...notificationConfig);
      observer.disconnect();
      whatsappChromeExtensionOnlineObserver = null;
      return;
    }
  };
  
  // Create an observer instance linked to the callback function
  console.log('Watching for online status changes started');
  whatsappChromeExtensionOnlineObserver = new MutationObserver(callback);
  
  // Start observing the target node for configured mutations
  whatsappChromeExtensionOnlineObserver.observe(mainElement, config);

  new Notification('🔎🟢', {
    body: `Started monitoring ${whatsappChromeExtensionContactName}`,
    icon: profilePicSrc,
  });
  startWatching(whatsappChromeExtensionContactName);
  sendResponse({whatsappChromeExtensionContactName})
});