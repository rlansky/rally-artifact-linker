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