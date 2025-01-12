import { getActiveTabURL } from "./utils.js";

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarkElement, bookmark) => {
    const bookmarkTitleElement = document.createElement('div');   //for displaying title
    const controlsElement = document.createElement("div");        //for play and delete button
    const newBookmarkElement = document.createElement('div');     //this will contain title play button basically entire bookmark

    bookmarkTitleElement.textContent = bookmark.desc;             //in contentscript inside newbookmarkhandler func we created newBookmark obj which have desc value
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";

    setBookmarkAttributes("play-button", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.id = "bookmark-" + bookmark.time;          //in contentscript inside newbookmarkhandler func we created newBookmark obj which have time value
    newBookmarkElement.className="bookmark"
    newBookmarkElement.setAttribute('timestamp', bookmark.time);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);

    bookmarkElement.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarkElement = document.getElementById('bookmarks');    //get the bookmark div(bookmark div present in popup.html to show bookmarks)
    bookmarkElement.innerHTML = "";

    //if we have already bookmarks present in our array currentBookmarks for a video
    if(currentBookmarks.length > 0){
        for(let i = 0; i < currentBookmarks.length; i++) {
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarkElement, bookmark);  
        }
    }
    //if we have dont have any bookmarks present in our array currentBookmarks for a video
    else{
        bookmarkElement.innerHTML = '<i class = "row"> No bookmarks to show </i>';
    }
    return;
};

const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();
  
    chrome.tabs.sendMessage(activeTab.id, {
      type: "PLAY",
      value: bookmarkTime,
    });
  };
  
  const onDelete = async (e) => {
    const activeTab = await getActiveTabURL();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    const queryParameter = activeTab.url.split("?")[1];
    const urlParameter = new URLSearchParams(queryParameter);
    const currentVideoId = urlParameter.get("v");

    chrome.storage.sync.get([currentVideoId], (data) => {
        let currentBookmarks = data[currentVideoId] ? JSON.parse(data[currentVideoId]) : [];
        currentBookmarks = currentBookmarks.filter((bookmark) => bookmark.time != bookmarkTime);

        // Update storage
        chrome.storage.sync.set({ [currentVideoId]: JSON.stringify(currentBookmarks) });

        // Refresh bookmarks
        viewBookmarks(currentBookmarks);
    });

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime,
    });
};

  
  const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");    //controlElement is generalized and used for both play and delete button
  
    controlElement.src = "assets/" + src + ".png";           //for play src=play-button and for delete src=delete
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
  };


//when our html document initially loaded this even run
document.addEventListener("DOMContentLoaded", async() =>{
    const activeTab = await getActiveTabURL();
    const queryParameter = activeTab.url.split("?")[1];               
    const urlParameter = new URLSearchParams(queryParameter);  
    
    const currentVideoId = urlParameter.get("v");

    //if the tab is youtube then we show the bookmarks
    if(activeTab.url.includes("youtube.com/watch") && currentVideoId){
        //fetch the bookmarks from chrome storage
        chrome.storage.sync.get([currentVideoId], (data)=>{
            const currentVideoBookmark = data[currentVideoId] ? JSON.parse(data[currentVideoId]) : [];
            
            //show the bookmarks to user(in popup window)
            viewBookmarks(currentVideoBookmark);
        })
    }
    //if the tab is not youtube then we will show some msg
    else{
        const container = document.getElementsByClassName('container')[0];
        container.innerHTML = '<div class="title">Not a youtube Page😪</div> ';
        // Apply some basic styles
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.style.marginTop = "20px";
    }
});
