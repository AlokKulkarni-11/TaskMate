chrome.runtime.onInstalled.addListener(() => {
  console.log('TaskMate background service worker installed.');
});

// Listen for messages from popup or other parts to schedule notifications
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'scheduleNotification') {
    const { taskId, title, message: notifMessage, dueTime } = message.payload;
    const now = Date.now();
    const delay = dueTime - now;

    if (delay > 0) {
      setTimeout(() => {
        chrome.notifications.create(taskId, {
          type: 'basic',
          iconUrl: 'assets/icons/icon128.png',
          title: title,
          message: notifMessage,
          priority: 2
        });
      }, delay);
    }
    sendResponse({ status: 'scheduled' });
  }
});
