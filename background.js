//  The listener that tells the linker script when to execute
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (isLinkableRallyUrl(tab.url) && changeInfo.status === 'complete') {
        //  Trigger the event that causes us to check the page
        chrome.tabs.sendMessage(tabId, {tabUpdated: true});
    }
});

function isLinkableRallyUrl(url) {
    return  (url.indexOf('http://localhost:7001') === 0 ||
             url.indexOf('.rallydev.com/') !== -1) &&
            url.indexOf('edit.sp') == -1 &&
            url.indexOf('new.sp') == -1 &&
            url.indexOf('copy.sp') == -1;
}

//  Handles requests to get the prefixes that should be turned into links
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method === "getPrefixes") {
        sendResponse({prefixes: getStoredPrefixes()});
    } else {
        sendResponse({});
    }
});

//  UGH... had to duplicate this from storage.js
function getStoredPrefixes() {
    var storedResults = localStorage['rally_artifact_linker_prefixes'];
    if (!storedResults) {
        storedResults = "US\nDE\nTA\nTC\nDS\nF\nP\nT\nI"
    }
    return storedResults.split("\n");
}