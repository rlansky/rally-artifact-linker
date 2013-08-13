chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (isRallyUrl(tab.url) && changeInfo.status === 'complete') {
        //  Trigger the event that causes us to check the page
        chrome.tabs.sendMessage(tabId, {tabUpdated: true});
    }
});

function isRallyUrl(url) {
    return  url.indexOf('http://localhost:7001') === 0 ||
            url.indexOf('.rallydev.com/') !== -1;
}