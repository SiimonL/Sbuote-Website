const API_URL = "http://localhost:5000/";
// const API_URL = "http://siimonl.me/api/";
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

function setCookie(field, value, timeDays, sameSite) {
    const date = new Date();
    date.setDate(date.getTime() + (timeDays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toGMTString();
    document.cookie = `${field}=${value}; ${expires}; path=/; sameSite=${sameSite}`;
}

function hasCookie(field) {
    const decoded = decodeURIComponent(document.cookie);

    return decoded.split('; ').some((cookie) => cookie.startsWith(`${field}=`));
}

function getCookie(field) {
    const decoded = decodeURIComponent(document.cookie);

    return decoded.split('; ').find((cookie) => cookie.startsWith(`${field}=`))?.split('=')[1];
}

function deleteCookie(field) {
    document.cookie = `${field}=; expires=Thu, 01 Jan 1970 00: 00: 01 GMT; path=/; sameSite=Lax`;
}

// Redirects away from the login page if credentials are alreay saved in cookies
async function loginPageRedirectCheck() {
    // Redirect to the search page if username and valid password are cached.
    if (hasCookie('username') && hasCookie('password')) {
        // const response = await fetch(`${API_URL}/login?user=${getCookie('username')};${getCookie('password')}`);
        const response = { ok: true };

        if (response.ok) {
            window.location.replace(`${window.location.href.split('?')[0]}search`);
        }
    }
}

// Check on every page that redirects back to login page if credentials missing or not valid.
async function savedCredentialCheck() {
    if (hasCookie('username') && hasCookie('password')) {
        // const response = await fetch(`${API_URL}/login?user=${getCookie('username')};${getCookie('password')}`);
        const response = { ok: true };

        if (!response.ok) {
            window.location.replace(`${window.location.origin}/front-end/`);
        }
    } else {
        window.location.replace(`${window.location.origin}/front-end/`);
    }
}

async function getKeywordList() {
    let response = await fetch(`${API_URL}api/keywords`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (response.ok) {
        let keywords = await response.json();
        return keywords;
    } else {
        console.log(response.status + ": Error loading keyword list.");
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

function signOut() {
    deleteCookie('username');
    deleteCookie('password');
    window.location.replace(`${window.location.origin}/front-end/`)
}