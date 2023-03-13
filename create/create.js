
const KEYWORD_DATALIST = document.querySelector('#all-keywords');
const SELECTED_KEYWORDS = document.querySelector('#selected-keywords');
const CREATE_FORM = document.querySelector('#create-form');

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

async function createSbuote(data) {
    //Adds a sbuote to the internal database
    let response = await fetch(`${API_URL}/create`, {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    return response.status;
}

// To Stop the form from submitting after pressing enter.
CREATE_FORM.addEventListener('keydown', e => {
    if (e.isComposing || e.code == 'Enter') {
        if (document.activeElement.id == 'keywords') {
            // If the keyword text input is focused, trigger a keyword add event.
            document.activeElement.dispatchEvent(new Event('change'));
        }
        e.preventDefault();
    }
});

document.querySelector('#create-icon').addEventListener('click', e => {
    document.activeElement.dispatchEvent(new Event('change'));
});

// Adds a keyword to the selected list above the search bar after a 'change' event gets triggered
document.querySelector('#keywords').addEventListener('change', e => {
    e.preventDefault();
    if (SELECTED_KEYWORDS.children.length > 7 || !e.target.checkValidity()) {
        return;
    }

    if (e.target.value == '' || Array.from(SELECTED_KEYWORDS.children).some((keyword) => keyword.innerText == e.target.value)) {
        return;
    }
    SELECTED_KEYWORDS.innerHTML += `<div class="keyword icon-right" onclick="this.remove();">${e.target.value}</div>`
    e.target.value = '';
});

// Custom handling for the form submission
CREATE_FORM.addEventListener('submit', async e => {
    e.preventDefault();

    if (!CREATE_FORM.checkValidity()) {
        return false;
    }
    if (!window.confirm("Are you sure you want to continue?")) {
        return false;
    }

    let keywords = Array.from(SELECTED_KEYWORDS.children).map((value, _i) => {
        return value.innerText.toLowerCase();
    });


    let status = await createSbuote({
        link: document.querySelector('#sbuote-link').value,
        keywords: keywords
    });

    if (status == 200) {
        window.alert('Added sbuote.');
        window.location.replace(`${window.location.origin}/search`);
    } else {
        window.alert('Failed to add sbuote.');
    }

});


// Shake animation on text fields if something's incorrect
document.querySelectorAll('input[type=text]').forEach((node, i) => node.addEventListener('invalid', e => {
    e.target.classList.remove('shake-anim');
    void e.target.offsetWidth;
    e.target.classList.add('shake-anim');
}));