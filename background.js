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