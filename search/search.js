const KEYWORD_DATALIST = document.querySelector('#all-keywords');
const SEARCH_FORM = document.querySelector('#search-form');
const SELECTED_KEYWORDS = document.querySelector('#selected-keywords');
const RESULTS_DIV = document.querySelector('#results');

async function createKeywordList() {
    // Get a full list of every used keyword for autofill purposes
    // Might limit to 'x most popular keywords' in the future if keyword amount grows too big
    const keywords = await getKeywordList();

    if (keywords) {
        for (let i = 0; i < keywords.length; i++) {
            KEYWORD_DATALIST.innerHTML += `<option value=${keywords[i]}>`;
        }
    }
}

function createCard(data) {
    // Create a card that gets displayed on screen from data gotten from the server
    let tagHTML = '';
    for (let i = 0; i < data.keywords.length; i++) {
        tagHTML += `<div class="tag">${data.keywords[i]}</div>`;
    }

    const card = document.createElement("div");
    card.classList.add('card');
    card.id = data.id.toString();
    card.innerHTML = `<div class=\"card-top\"><img src=\"${data.link}\" alt=\"${data.link}\"><div class=\"card-row\"><div class=\"tags\">${tagHTML}</div><div class=\"likes-container\"><p class=\"likes icon-left\ ${data.hasLiked ? 'active' : ''}" onclick=\"throttle(toggleLike, 1000)(this, ${data.id});\">${data.likes}</p></div></div></div><div class=\"card-bottom\"><div class=\"card-buttons\"><a class=\"open-image icon-left button\" href=\"${data.link}\" target=\"_blank\"></a><button class=\"copy-link icon-left button\" onclick=\"copyToClipboard(\'${data.link}\')\"></button></div><p class=\"date\">${data.date.split('T')[0]}</p></div>`;

    return card;
}

async function getQueryResults(searchParams) {
    let response = await fetch(`${API_URL}/search?${searchParams}`, {
        credentials: 'include',
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

async function updateLikeCount(id) {
    // POST request to server to add a like
    let response = await fetch(`${API_URL}/like`, {
        credentials: 'include',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sbuote: id })
    })
}


function updateResults(resultArray) {
    // Updates the sbuotes shown on screen
    RESULTS_DIV.innerHTML = '';
    for (let i = 0; i < resultArray.length; i++) {
        const newCard = createCard(resultArray[i]);
        RESULTS_DIV.appendChild(newCard);
    }
}

function toggleLike(element, id) {
    let added = element.classList.toggle('active');
    element.innerText = `${parseInt(element.innerText) + (added ? 1 : -1)}`;
    updateLikeCount(id);
}

async function preload() {
    let data = await getQueryResults('keywords=&sort=best&extra=&page=1');
    updateResults(data);
}

// Custom handling for the form submission
SEARCH_FORM.addEventListener('submit', async e => {
    e.preventDefault();

    if (!SEARCH_FORM.checkValidity()) {
        return false;
    };

    let formData = new FormData(SEARCH_FORM);
    let keywords = Array.from(SELECTED_KEYWORDS.children).map((value, _i) => {
        return value.innerText;
    });

    formData.set("keywords", keywords.join(KEYWORD_DELIMITER));
    formData.set("page", 1);
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
    e.target.classList.remove('shake-anim');
    void e.target.offsetWidth;
    e.target.classList.add('shake-anim');
}));


createKeywordList();
preload();