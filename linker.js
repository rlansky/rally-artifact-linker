//  Listen for the background job to tell us that we need to do something
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.tabUpdated === true) {
        window.setTimeout(addLinks, 1000);
    }
});

function addLinks(secondChance) {
    var matchesFound = false;
    getMatchingNodes().each(function(index, node) {
        matchesFound = true;
        if (!shouldIgnoreNode(node)) {
            updateContentWithLink(node);
        }
    });
    if (!matchesFound && typeof secondChance === "undefined") {
        //  We'll call this again to make sure they page has *really* been loaded
        window.setTimeout(addLinks(true), 5000);
    }
}

function getMatchingNodes() {
    var ignoredTags = ["HTML", "HEAD", "META", "SCRIPT", "TITLE", "LINK", "BODY", "A",
                       "TABLE", "TBODY", "TR",  "INPUT", "BUTTON", "IFRAME", "FORM"],
        regex = getRegExp();

    return $("*").filter(function() {
        return  ignoredTags.indexOf(this.tagName) === -1 &&
            this.childNodes &&
            this.childNodes[0] &&
            this.childNodes[0].nodeValue &&
            this.childNodes[0].nodeValue.search(regex) > -1;
    });
}

function getRegExp() {
    return /(US|DE|F|TA)(\d+)/i ;
}

//  Need to ignore certain nodes (those that are already links or never should be links)
function shouldIgnoreNode(node) {
    var levelsToCheck = 4,
        currentNode = node;
    for (var index = 0; index < levelsToCheck; index++) {
        if (!currentNode) {
            return false;
        } else if(currentNode.tagName === 'A' || (currentNode.className && currentNode.className.indexOf('action-header') > -1)) {
            return true;
        }
        currentNode = currentNode.parentNode;
    }

    return false;
}

function updateContentWithLink(node) {
    var clone = node.cloneNode(),
        content = node.childNodes[0].nodeValue,
        regex = getRegExp(),
        match = content.match(regex)[0],
        matchLoc = content.indexOf(match),
        textNode;

    //  If there is content before the link, add it
    if (matchLoc > 0) {
        textNode = document.createTextNode(content.slice(0, matchLoc));
        clone.appendChild(textNode);
    }

    //  Add the link
    clone.appendChild(getLinkNode(match));

    //  If there is content after the link, add it
    if (matchLoc + match.length < content.length - 1) {
        textNode = document.createTextNode(content.slice(matchLoc + match.length));
        clone.appendChild(textNode);
    }

    node.parentNode.replaceChild(clone, node);
}

//  Returns the node that is a link
function getLinkNode(content) {
    //  Dear lord this sucks... but if I try to setup a function to be called with the onClick event, I
    //  lose context (the context is the event, not the Rally page). So, I'm going with this abomination
    //  since it's all I can get working at this point.
    var linkContent = '<a href="javascript:void(0);" onClick="' +
            'searcher = Ext4.create(\'Rally.alm.search.HeaderSearchToolbar\');' +
            'searcher._onAfterContentUpdated = function(){this.destroy();};' +
            'searcher.formattedIdSearchEngine.search(\'' + content + '\');">' +
            content + '</a>';

    return $(linkContent)[0];
}