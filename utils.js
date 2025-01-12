//this function help us to get the current tab of the user(it is from google chrome documentation)
export async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}