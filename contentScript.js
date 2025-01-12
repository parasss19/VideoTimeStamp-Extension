//I used Immediately Invoked Function Expression (IIFE) that encapsulates logic related to handling messages sent from a background.js script
(()=>{
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";                   //used to store the ID of the currently loaded video.
    let currentVideoBookmark = [];           //used to store all video bookmark


    //to listen msg from background.js
    chrome.runtime.onMessage.addListener((obj)=>{
      const{type, videoId} = obj;            //extracts type, videoId from the obj(message object).
      
      //If a new video has been loaded.
      if(type == "NEW"){
        currentVideo = videoId;              //currentVideo var is updated to the videoId from the message.
        newVideoLoaded();         
      }
    });

    //fetch the bookmarks from chrome storage
    const fetchBookmarks = () =>{
      return new Promise((resolve) =>{
         chrome.storage.syn.get([currentVideo], (obj)=>{
           resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [])
         })
      })
    }


    //function to handle the new video loaded
    const newVideoLoaded = async() => {
      const bookmarkExists = document.getElementsByClassName("bookmark-btn")[0];    //check if the bookmark button already exists.
      
      currentVideoBookmark = await fetchBookmarks();

      if(bookmarkExists) return;                                                    //if the bookmark button already exists, return.
      else{
        const bookmarkBtn = document.createElement('img');                          //create a new img element for the bookmark button.
        bookmarkBtn.src = chrome.runtime.getURL('assets/bookmark.png');             //set the path of the bookmark image.
        bookmarkBtn.className = "ytp-button" + "bookmark-btn";                      //set the class name of the bookmark button.
        bookmarkBtn.title = "Bookmark";                                             
        
        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];   //get the left controls of the youtube player(yt store its left control in class = "ytp-left-controls").
        youtubePlayer = document.getElementsByClassName("video-stream")[0];              //get the youtube player(yt store its player in class = "video-stream") it is basically the entire video screen

        youtubeLeftControls.appendChild(bookmarkBtn);                                   //append the bookmark button to the left controls of the youtube player.
        bookmarkBtn.addEventListener("click", newBookmarkHandler);                      //
      }
    }

    //function to handle the new bookmark
    const newBookmarkHandler = async() => {
      const currTime = youtubePlayer.currentTime;     //currentTime is a property of the video player that returns the current playback time in seconds
      //newBookmark obj
      const newBookmark = {
        time : currTime,
        desc : "Bookmark at :" + getTime(currTime)     //getTime function to format currentTime into a human-readable time (e.g., 00:02:03).
      }

      currentVideoBookmark = await fetchBookmarks();

      //Sync Bookmarks with Chrome Storage
      //1 Access or Create the Bookmark List = currentVideoBookmark is the existing list of bookmarks for this video.
      //2 Add the New Bookmark = The new bookmark is added to the existing list using the spread operator [...currentVideoBookmark, newBookmark].
      //3 Sort bookmark = The list is sorted in ascending order by time so that earlier bookmarks come first .sort((a, b) => a.time - b.time)
      //4 Store the Updated List in Chrome Storage: JSON.stringify(updatedBookmarks)
      const updatedBookmarks = [...currentVideoBookmark, newBookmark].sort((a, b) => a.time - b.time);
      chrome.storage.sync.set({
       [currentVideo] : JSON.stringify(updatedBookmarks)
      })
    }

    newVideoLoaded(); 
})()


//getTime function to format currentTime into a human-readable time(e.g., 00:02:03).
const getTime = (t) =>{
  var date = new Date();                         //creates a new Date object,
  date.setSeconds(t);                            //sets the sec of the date object to the value of t
  return date.toISOString().substring(11,8);    //toISOString() converts the date object like YYYY-MM-DDTHH:mm:ss.sssZ
}
