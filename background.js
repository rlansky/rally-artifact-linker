//  Handles requests to get the prefixes that should be turned into links
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method === "getPrefixes") {
        sendResponse({prefixes: getStoredPrefixes()});
    } else {
        sendResponse({});
    }
});

//  Returns an array
function getStoredPrefixes() {
    var storedResults = localStorage['rally_artifact_linker_prefixes'];
    if (!storedResults) {
        storedResults = "US\nDE\nTA\nTC\nDS\nF\nP\nT\nI"
    }
    return storedResults.split("\n");
}

//  Expects an array
function setStoredPrefixes(prefixes) {
    localStorage['rally_artifact_linker_prefixes'] = prefixes.join("\n");
}