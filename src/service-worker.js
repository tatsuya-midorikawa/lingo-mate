async function enableSidePanelAction() {
  if (!chrome.sidePanel?.setPanelBehavior) {
    return;
  }

  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch (error) {
    console.warn("Lingomate could not configure the side panel action.", error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  enableSidePanelAction();
});

chrome.runtime.onStartup.addListener(() => {
  enableSidePanelAction();
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!chrome.sidePanel?.open) {
    return;
  }

  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (error) {
    console.warn("Lingomate could not open the side panel.", error);
  }
});