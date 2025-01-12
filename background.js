//if the tab is updated, check if the tab is on youtube.com/watch or not , tabId: The unique ID of the tab that was updated. and tab: An object representing the tab's properties (e.g., url).
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  //Check if Tab is a YouTube Video, Verifies that the url property exists and includes the substring youtube.com/watch.
  if(tab.url && tab.url.includes("youtube.com/watch")){
   const queryParameter = tab.url.split("?")[1];                //to get the unique code of every video(split method will split the url string inside array with '?' as a separator)
   const urlParameter = new URLSearchParams(queryParameter);    // URLSearchParams interface defines utility methods to work with the query string of a URL.
  
   //Send msg(as new video is loaded)to content script
   chrome.tabs.sendMessage(tabId, {
       type: "NEW",                      //Indicates that a new video has loaded.
       videoId : urlParameter.get("v")   //Extracts the v parameter(videoId = 0n809nd4Zu4&t=537s)value from the queryParameter('v=0n809nd4Zu4&t=537s').
   })
  }
})


// Initial URL: https://www.youtube.com/watch?v=0n809nd4Zu4&t=537s
// Step 1: Split URL
// Result: ['https://www.youtube.com/watch', 'v=0n809nd4Zu4&t=537s']
// Extracted queryParameters: 'v=0n809nd4Zu4&t=537s'

// Step 2: Parse Query Parameters
// URLSearchParams: Parses v=0n809nd4Zu4&t=537s.
// urlParameter.get("v"): Returns '0n809nd4Zu4' (the video ID).

// Step 3: Send Message
// Sends { type: "NEW", videoId: "0n809nd4Zu4" } to the content script.