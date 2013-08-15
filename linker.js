//  Need to initialize the regular expression from the preferences
var ralRegex = null;
chrome.runtime.sendMessage({method: "getPrefixes"}, function(response) {
   ralRegex = response.prefixes;
});


//  Listen for the injected script to publish an event
window.addEventListener("message", function(event) {
    if (event.source === window && event.data && event.data.updated && !shouldIgnorePage(event)) {
        addLinks();
    }
}, false);

function addLinks() {
    getMatchingNodes().each(function(index, node) {
        updateNodeContent(node);
    });
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
            if (node.nodeValue && node.nodeValue.search(regex) > -1 && !shouldIgnoreNode(node)) {
                matchFound = true;
                return false;
            }
        });
        return matchFound;
    });
}

function getRegExp() {
    return new RegExp('(\\s+?|^)(' + ralRegex.join('|') + ')(\\d+)', 'i');
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
                   (currentNode.id && currentNode.id === 'devFooter') ||
                   (currentNode.className &&
                       (currentNode.className.indexOf('action-header') > -1 ||
                        currentNode.className.indexOf('rally-editable') > -1))) {
            return true;
        }
        currentNode = currentNode.parentNode;
    }

    return false;
}

//  Need to ignore certain pages
function shouldIgnorePage(event) {
    var href = event.target.location.href;
    return href.indexOf('edit.sp') > -1 || href.indexOf('new.sp') > -1 || href.indexOf('copy.sp') > -1;
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
        match, matchStart, trimmedMatch;

    while ((match = regex.exec(content)) !== null) {
        //  Pick up text prior to the last match (if any)
        trimmedMatch = $.trim(match[0]);
        matchStart = regex.lastIndex - trimmedMatch.length;
        if (previousMatchIndex < matchStart) {
            clone.appendChild(getTextNode(content.slice(previousMatchIndex, matchStart)));
        }

        //  Pick up the match itself and keep track of this last index
        clone.appendChild(getLinkNode($.trim(match[0])));
        previousMatchIndex = regex.lastIndex;
    }

    //  Pick up trailing text (if any)
    if (previousMatchIndex < content.length) {
        clone.appendChild(getTextNode(content.slice(previousMatchIndex)));
    }
}

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

function getTextNode(text) {
    return document.createTextNode(text);
}