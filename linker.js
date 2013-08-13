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
            updateNodeContent(node);
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

    //  Will find matches even if there are multiple child nodes in a node
    return $("*").filter(function() {
        if (ignoredTags.indexOf(this.tagName) > -1 || !this.childNodes || this.childNodes.length < 1) {
            return false;
        }
        var matchFound = false;
        $.each(this.childNodes, function(index, node) {
            if (node.nodeValue && node.nodeValue.search(regex) > -1) {
                matchFound = true;
                return false;
            }
        });
        return matchFound;
    });
}

function getRegExp() {
    return /(US|DE|TA|TS|DS|F|P|T|I)(\d+)/i;
}

function getRegExpGlobal() {
    return new RegExp(getRegExp().source, 'ig');
}

//  Need to ignore certain nodes (those that are already links or never should be links)
function shouldIgnoreNode(node) {
    var levelsToCheck = 5,
        currentNode = node;
    for (var index = 0; index < levelsToCheck; index++) {
        if (!currentNode) {
            return false;
        } else if (currentNode.tagName === 'A' ||
                   (currentNode.className &&
                       (currentNode.className.indexOf('action-header') > -1 ||
                        currentNode.className.indexOf('rally-editable') > -1))) {
            return true;
        }
        currentNode = currentNode.parentNode;
    }

    return false;
}

function updateNodeContent(node) {
    var clone = node.cloneNode(),
        regex = getRegExp();

    //  Loop through each node... add those that don't have a match, update those that do.
    $.each(node.childNodes, function(index, childNode) {
        if (childNode && childNode.nodeValue && childNode.nodeValue.search(regex) > -1 && !shouldIgnoreNode(childNode)) {
            createLinkedContent(clone, childNode.nodeValue);
        } else {
            clone.appendChild(childNode.cloneNode(true));
        }
    });

    node.parentNode.replaceChild(clone, node);
}

function createLinkedContent(clone, content) {
    var regex = getRegExpGlobal(),
        previousMatchIndex = 0,
        match, matchStart;

    while ((match = regex.exec(content)) !== null) {
        //  Pick up text prior to the last match (if any)
        matchStart = regex.lastIndex - match[0].length;
        if (previousMatchIndex < matchStart) {
            clone.appendChild(document.createTextNode(content.slice(previousMatchIndex, matchStart)));
        }

        //  Pick up the match itself and keep track of this last index
        clone.appendChild(getLinkNode(match[0]));
        previousMatchIndex = regex.lastIndex;
    }

    //  Pick up trailing text (if any)
    if (previousMatchIndex < content.length) {
        clone.appendChild(document.createTextNode(content.slice(previousMatchIndex)));
    }
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