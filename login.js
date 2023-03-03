


function setCookie(field, value, time, sameSite) {
    const date = new Date();
    date.setDate(date.getTime() + (time * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString();
    document.cookie = `${field}=${value}; ${expires}; path=/; sameSite=${sameSite}`;
}

function hasCookie(field) {
    const decoded = decodeURIComponent(document.cookie);

    return decoded.split('; ').some((cookie) => cookie.startsWith(`${field}=`));
}

// Redirect to the search page if username and valid password are cached.
if (hasCookie('username') && hasCookie('password')) {
    const response = await fetch(`${API_URL}/login?user=${getCookie('username')};${getCookie('password')}`);

    if (response.ok) {
        window.location.replace(`${window.location}search`);
    }
}

const API_URL = "http://localhost:5000/";
// const API_URL = "http://siimonl.me/api/";
const LOGIN_FORM = document.querySelector('#login-form');
const LOGIN_ERROR = document.querySelector('#login-error');

// Custom handling for the form submission
LOGIN_FORM.addEventListener('submit', async e => {
    e.preventDefault();
    console.log('submitted');

    if (!LOGIN_FORM.checkValidity()) {
        console.log('invalid!!!');
        return false;
    }

    let formData = new FormData(LOGIN_FORM);
    formData.set('pass', btoa(formData.get('pass')));

    const response = await fetch(`${API_URL}/login?${new URLSearchParams(formData)}`);

    if (response.ok) {
        // Server confirmed that the password is valid
        setCookie('username', formData.get('user'), 200);
        setCookie('password', formData.get('pass'), 200);
        window.location.replace(`${window.location}search`);
    } else {
        if (response.status == 401) {
            LOGIN_ERROR.innerText = 'Invalid Password.';
        } else {
            throw new Error(`HTTP error ${response.status}`);
        }
    }

});

// Clears all error indicators when user changes input fields.
document.querySelectorAll('input').forEach((node, _i) => node.addEventListener('input', e => {
    e.target.classList.remove('invalid');
    document.querySelector(`#${e.target.id}-error`).innerText = '';
    LOGIN_ERROR.innerText = '';

}));

// Trigged by the .checkValidity() method in the form submit listener if the fields are invalid
document.querySelectorAll('input').forEach((node, _i) => node.addEventListener('invalid', e => {
    e.target.classList.remove('shake-anim');
    void e.target.offsetWidth;
    e.target.classList.add('shake-anim');
    e.target.classList.add('invalid');

    const errorField = document.querySelector(`#${e.target.id}-error`);
    const minLen = e.target.getAttribute('minlength');
    const maxLen = e.target.getAttribute('maxlength');

    if (e.target.value.length < minLen) {
        errorField.innerText = `${e.target.id} must be at least ${minLen} characters long.`;
    } else if (e.target.value.length > maxLen) {
        errorField.innerText = `${e.target.id} can\t be longer than ${maxLen} characters.`;
    } else if (e.target.value.match(/[^a-zA-Z1-9]+/g)) {
        errorField.innerText = `${e.target.id} can only contain letters or numbers.`;
    }

}));
