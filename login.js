
const LOGIN_FORM = document.querySelector('#login-form');
const LOGIN_ERROR = document.querySelector('#login-error');

// Custom handling for the form submission
LOGIN_FORM.addEventListener('submit', async e => {
    e.preventDefault();

    if (!LOGIN_FORM.checkValidity()) {
        return false;
    }

    let formData = new FormData(LOGIN_FORM);

    const auth = {
        user: formData.get('user'),
        pass: window.btoa(formData.get('pass'))
    }

    const response = await fetch(`${API_URL}/login`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(auth)
    });
    // const response = { ok: true };

    if (response.ok) {
        // Server confirmed that the password is valid
        window.location.replace(`${window.location.href.split('?')[0]}/search`);
    } else {
        if (response.status == 403) {
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
    } else if (e.target.value.match(/[^a-zA-Z0-9]+/g)) {
        errorField.innerText = `${e.target.id} can only contain letters or numbers.`;
    }

}));
