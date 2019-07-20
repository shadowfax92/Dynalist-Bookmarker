// OnInstall handler
chrome.runtime.onInstalled.addListener(details => {
  console.log(details);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === "store-data") {
      console.log("storing data: "+ request.data);
      sendResponse({ action: "saved" });
    }
  }
);

