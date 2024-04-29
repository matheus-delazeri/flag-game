var originalFlag = null;
var erasedFlag = null;
var answer = "";

let answeredFlags = new Set(JSON.parse(sessionStorage.getItem('answeredFlags')) || []);

function saveAnsweredFlags() {
    sessionStorage.setItem('answeredFlags', JSON.stringify(Array.from(answeredFlags)));
}

$(document).ready(function () {
    $('#loader').show();

    // Fetch flag data
    fetchFlag().then(async function (data) {
        LoadTips(data);
        SetFirstGameStatus();

        // Access the URL and get the SVG data
        const flag_url = data.flag;
        await $.get(flag_url, async function (flag_data, status) {
            originalFlag = await flag_data.getElementsByTagName("svg")[0];
            answer = data.name;

            // Add the flag to the set of answered flags and save the set
            answeredFlags.add(answer);
            saveAnsweredFlags();
        });

        // Erase the flag colors to start the game
        EraseFlagColors(attempts);
        $('#loader').hide();
    });
});

// Load all countries' names for suggestions
$(document).ready(function () {
    $.get("https://flags-api-8ul8.onrender.com/names", function (country_data, status) {
        suggestions = country_data;
        localStorage.setItem("suggestions", JSON.stringify(suggestions));
    });
});

$(function () {
    $("form").submit(function (e) {
        return false;
    });
});

$(function () {
    $("form").submit(function (e) {
        e.preventDefault();
        var guess = $("#input").val();

        SubmitGuess(guess);
    });
});

async function fetchFlag() {
    let flagData;
    let isDuplicateFlag;

    do {
        flagData = await $.get("https://flags-api-8ul8.onrender.com/random");

        isDuplicateFlag = answeredFlags.has(flagData.name);

        if (!isDuplicateFlag) {
            break;
        }
    } while (isDuplicateFlag);

    return flagData;
}

function LoadTips(jsonData) {
    const tips = [];
    tips[0] = "Continent: " + jsonData.continente;
    tips[1] = "Capital: " + jsonData.capital;
    tips[2] = "Language: " + Object.values(jsonData.lingua);
    tips[3] = "Currency: " + jsonData.moeda;
    tips[4] = " ";

    localStorage.setItem("tips", JSON.stringify(tips));
}

function SetFirstGameStatus() {
    const attempts = 0;
    const maxAttempts = 5;

    localStorage.setItem("attempts", attempts);
    localStorage.setItem("maxAttempts", maxAttempts);
}

function SubmitGuess(guess) {
    let attempts = localStorage.getItem("attempts");
    const maxAttempts = localStorage.getItem("maxAttempts");

    if (guess.toLowerCase() === answer.toLowerCase()) {
        alert("Congratulations! You guessed the right country!");
        ShowRightCountry();
        EraseFlagColors(16);
    } else {
        attempts++;
        localStorage.setItem("attempts", attempts);
        EraseFlagColors(attempts);
        UpdateAttempts(guess);
        UpdateTips();
    }

    if (attempts >= maxAttempts) {
        alert("You have reached the maximum number of attempts. The right country was: " + answer);
        EraseFlagColors(16);
        ShowRightCountry();
    }

    localStorage.setItem("attempts", attempts);
}

function UpdateAttempts(attempt) {
    const attempts = localStorage.getItem("attempts");
    
    // Update text
    const attemptsDiv = document.getElementById("attempts");
    const text_num_attempts = attemptsDiv.getElementsByTagName("h3");
    text_num_attempts[0].innerHTML = "Attempts: " + attempts + "/5";

    // Add new attempt
    const newAttempt = document.createElement("div");
    const country = document.createElement("p");
    country.innerHTML = attempt;
    
    newAttempt.className = "attempt";
    newAttempt.appendChild(country);
    attemptsDiv.appendChild(newAttempt);
}

function UpdateTips() {
    const attempts = localStorage.getItem("attempts");

    if (attempts > 4) {
        return;
    }

    // Update text
    const tipsDiv = document.getElementById("tips");
    const text_num_tips = tipsDiv.getElementsByTagName("h3");
    text_num_tips[0].innerHTML = "Tips: " + attempts + "/4";

    // Add new tip
    const tips = JSON.parse(localStorage.getItem("tips"));
    const newTip = document.createElement("div");
    const tip = document.createElement("p");
    tip.innerHTML = tips[attempts - 1];
    
    newTip.className = "tip";
    newTip.appendChild(tip);
    tipsDiv.appendChild(newTip);
}

function ShowRightCountry() {
    const h1 = document.getElementById("guess");
    h1.innerHTML = answer;

    const attempts = localStorage.getItem("attempts");

    if (attempts >= 5) {
        h1.style.color = "red";
    } else {
        h1.style.color = "green";
    }
}

function EraseFlagColors(num_colors) {
    erasedFlag = originalFlag.cloneNode(true);

    const newFlag = EraseColors(new XMLSerializer().serializeToString(erasedFlag), num_colors);
    erasedFlag = new DOMParser().parseFromString(newFlag, "image/svg+xml").getElementsByTagName("svg")[0];

    const flagDiv = document.getElementById("flag");
    flagDiv.removeChild(flagDiv.firstChild);
    flagDiv.appendChild(erasedFlag);
}

function EraseColors(rawflag, not_erase_num) {
    // Iterate over the flag and replace color
    let i = 0;
    let flag = rawflag;
    const dict = {};
    while (i < flag.length) {
        if (flag[i] === '#') {
            let end = i;
            while (flag[end] !== "\"" && end < flag.length) {
                end++;
            }
            let color = flag.substring(i, end);

            if (color.length !== 7 && color.length !== 4) {
                color = '#a';
            }

            if (dict[color]) {
                i++;
                continue;
            }

            if (Object.keys(dict).length < not_erase_num) {
                if (color !== '#fff' && color !== '#FFF' && color !== '#ffffff' && color !== '#FFFFFF') {
                    dict[color] = true;
                    i++;
                    continue;
                }
            }

            flag = flag.substring(0, i) + '#ffffff' + flag.substring(end, flag.length);
        }
        i++;
    }
    return flag;
}

// Function to handle input change
function onInputChange() {
    const input = document.getElementById("input");
    const suggestions = document.getElementById("suggestions");
    const query = input.value.toLowerCase();

    // Clear previous suggestions
    suggestions.innerHTML = "";

    // Filter country names based on input
    const countries = JSON.parse(localStorage.getItem("suggestions"));
    const filteredCountries = countries.filter(country => country.toLowerCase().startsWith(query));

    // Display filtered countries
    filteredCountries.forEach(country => {
        const suggestion = document.createElement("div");
        suggestion.textContent = country;
        suggestion.onclick = () => {
            input.value = country;
            suggestions.innerHTML = "";
            SubmitGuess(country);
        };
        suggestions.appendChild(suggestion);
    });
}
