let whatsappChromeExtensionOnlineObserver = null;
let whatsappChromeExtensionContactName = null;

chrome.runtime.onMessage.addListener(async msg => {
  console.log('content.js received message', msg);
  const isOnWhatsAppWebDomain = window.location.href.includes('web.whatsapp.com');
  if (msg != 'START_TO_WATCH_ONLINE' && isOnWhatsAppWebDomain) {
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
  chrome.runtime.sendMessage({
    message: 'SET_CONTACT_NAME',
    payload: whatsappChromeExtensionContactName,
  });

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
  
  if (msg === 'START_TO_WATCH_ONLINE') {
    const isOnline = !!mainElement.querySelector('span[title="online"]');

    if (isOnline) {
      new Notification(...notificationConfig);
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
    whatsappChromeExtensionOnlineObserver = new MutationObserver(callback);
    
    // Start observing the target node for configured mutations
    whatsappChromeExtensionOnlineObserver.observe(mainElement, config);

    new Notification('🔎🟢', {
      body: `Started monitoring ${whatsappChromeExtensionContactName}`,
      icon: profilePicSrc,
    });
  }
});