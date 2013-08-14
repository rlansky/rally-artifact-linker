function save() {
    var enteredValues = document.getElementById('prefixes').value.split("\n"),
        enteredValuesLength = enteredValues.length,
        i = 0,
        trimmedValue,
        trimmedValues = [];

    for ( ; i < enteredValuesLength; i++) {
        trimmedValue = enteredValues[i].toUpperCase().trim();
        if (trimmedValue !== '') {
            trimmedValues.push(trimmedValue);
        }
    }

    if (trimmedValues.length === 0) {
        update_status('Sorry, you do not enter valid data', 'failure');
    } else {
        setStoredPrefixes(trimmedValues);
        update_status('Your changes have been saved!', 'success');
    }
    setExistingOptions();
}

function update_status(msg, className) {
    var status = document.getElementById('status');
    status.innerHTML = msg;
    status.className = className;

    setTimeout(function() {
        status.innerHTML = '';
        status.className = '';
    }, 4000);
}

function setExistingOptions() {
    document.getElementById('prefixes').value = getStoredPrefixes().join('\n');
}

document.addEventListener('DOMContentLoaded', setExistingOptions);
document.getElementById('save').addEventListener('click', save);