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