function copyToClipboard(text) {
    let successful = false
    navigator.clipboard.writeText(text).then(() => {
        successful = true;
    }, () => {
        successful = false;
    });
    return successful;
}

function setCookie(field, value, time, sameSite) {
    const date = new Date();
    date.setDate(date.getTime() + (time * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString();
    document.cookie = `${field}=${value}; ${expires}; path=/; sameSite=${sameSite}`;
}

function deleteCookie(field) {
    setCookie(field, null, 0, 'Lax');
}

function getCookie(field) {
    const decoded = decodeURIComponent(document.cookie);

    return decoded.split('; ').find((cookie) => cookie.startsWith(`${field}=`))?.split('=')[1];
}

const API_URL = "http://localhost:5000/";
// const API_URL = "http://siimonl.me/api/";
const KEYWORD_DATALIST = document.querySelector('#all-keywords');
const KEYWORD_DELIMITER = "-";
const SEARCH_FORM = document.querySelector('#search-form');
const SELECTED_KEYWORDS = document.querySelector('#selected-keywords');
const RESULTS_DIV = document.querySelector('#results')
let username = getCookie('username');
let password = getCookie('password');

async function createKeywordList() {
    let response = await fetch(`${API_URL}api/keywords`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (response.ok) {
        let keywords = await response.json();
        for (let i = 0; i < keywords.length; i++) {
            KEYWORD_DATALIST.innerHTML += `<option value=${keywords[i]}>`;
        }
    } else {
        console.log("Error loading keyword list. " + response.status + ": " + response.body.error);
        return null;
    }

}


function createCard(data) {
    let tagHTML = '';
    for (let i = 0; i < data.tags.length; i++) {
        tagHTML += `<div class="tag">${data.tags[i]}</div>`;
    }

    const card = document.createElement("div");
    card.classList.add('card');
    card.id = data.id.toString();
    card.innerHTML = `<div class=\"card-top\"><img src=\"${data.link}\" alt=\"${data.link}\"><div class=\"card-row\"><div class=\"tags\">${tagHTML}</div><div class=\"likes-container\"><p class=\"likes icon-left\">${data.likes}</p></div></div></div><div class=\"card-bottom\"><div class=\"card-buttons\"><a class=\"open-image icon-left\" href=\"${data.link}\" target=\"_blank\"></a><button class=\"copy-link icon-left\" onclick=\"copyToClipboard(\'${data.link}\')\"></button></div><p class=\"date\">${data.date}</p></div>`;

    return card;
}


async function getQueryResults(searchParams) {
    let response = await fetch(`${API_URL}search?${searchParams}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (response.ok) {
        let results = await response.json();
        return results;
    } else {
        console.log("HTTP Error " + response.status);
    }
}

async function addSbuote(data) {
    //Adds a sbuote to the internal database
    let response = await fetch(`${API_URL}post`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    return response.status;
}

function updateLikeCount(id, newValue) {

}


function updateResults(resultArray) {
    // Updates the sbuotes shown on screen
    RESULTS_DIV.innerHTML = '';
    for (let i = 0; i < resultArray.length; i++) {
        const newCard = createCard(resultArray[i]);
        RESULTS_DIV.appendChild(newCard);
    }
}

// Custom handling for the form submission
SEARCH_FORM.addEventListener('submit', async e => {
    e.preventDefault();
    console.log('submitted');

    if (!SEARCH_FORM.checkValidity()) {
        console.log('invalid!!!');
        return false;
    }

    let formData = new FormData(SEARCH_FORM);
    let keywords = Array.from(SELECTED_KEYWORDS.children).map((value, _i) => {
        return value.innerText;
    }).join(KEYWORD_DELIMITER);

    formData.set("keywords", keywords);
    formData.set("page", '1');
    formData.set("extra", formData.get("extra").replace(' ', '_'));

    let data = await getQueryResults(new URLSearchParams(formData));
    updateResults(data);

});

// To Stop the form from submitting after pressing enter.
SEARCH_FORM.addEventListener('keydown', e => {
    if (e.isComposing || e.code == 'Enter') {
        if (document.activeElement.id == 'keywords') {
            // If the keyword text input is focused, trigger a keyword add event.
            document.activeElement.dispatchEvent(new Event('change'));
        }
        e.preventDefault();
    }
});

document.querySelector('#search-icon').addEventListener('click', e => {
    document.activeElement.dispatchEvent(new Event('change'));
});

// Adds a keyword to the selected list above the search bar after a 'change' event gets triggered
document.querySelector('#keywords').addEventListener('change', e => {
    e.preventDefault();
    if (SELECTED_KEYWORDS.children.length > 7 || !e.target.checkValidity()) {
        return;
    }

    if (e.target.value == '') {
        return;
    }
    SELECTED_KEYWORDS.innerHTML += `<div class="keyword icon-right" onclick="this.remove();">${e.target.value}</div>`
    e.target.value = '';
});

// Shake animation on text fields if something's incorrect
document.querySelectorAll('input[type=text]').forEach((node, i) => node.addEventListener('invalid', e => {
    console.log('trigger invalid');
    e.target.classList.remove('shake-anim');
    void e.target.offsetWidth;
    e.target.classList.add('shake-anim');
}));


createKeywordList();
