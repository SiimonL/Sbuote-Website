const API_URL = "http://api.siimonl.me";
const KEYWORD_DELIMITER = "-";

function copyToClipboard(text) {
    let successful = false
    navigator.clipboard.writeText(text).then(() => {
        successful = true;
    }, () => {
        successful = false;
    });
    return successful;
}

// Redirects away from the login page if credentials are alreay saved in cookies
async function loginPageRedirectCheck() {
    // Redirect to the search page if username and valid password are cached.
    const response = await fetch(`${API_URL}/login`, {
        credentials: 'include',
        method: "POST",
    });
    // const response = { ok: true };

    if (response.ok) {
        window.location.replace(`${window.location.origin}/search`);
    }
}

// Check on every page that redirects back to login page if credentials missing or not valid.
async function savedCredentialCheck() {
    const response = await fetch(`${API_URL}/login`, {
        credentials: 'include',
        method: "POST"
    });
    // const response = { ok: true };

    if (!response.ok) {
        window.location.replace(`${window.location.origin}`);
    }
}

async function getKeywordList() {
    let response = await fetch(`${API_URL}/keywords`, {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    let results = await response.json();
    if (response.ok) {
        return results;
    } else {
        console.log(results);
        return null;
    }
}

// Limits a function's execution frequency to limit (milliseconds)
let inThrottle;
const throttle = (func, limit) => {
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

async function signOut() {
    let response = await fetch(`${API_URL}/logout`, {
        credentials: 'include',
        method: 'POST'
    });
    window.location.replace(`${window.location.origin}`);
}