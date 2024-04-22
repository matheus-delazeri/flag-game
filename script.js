var originalFlag = null;
var erasedFlag = null;
var answer = "";

$(document).ready(function () {
    $.get("https://flags-api-8ul8.onrender.com/random", async function (data, status) 
    {
        LoadTips(data);
        SetFirstGameStatus();
        
        //acess the url and get the svg data
        flag_url = data.flag;
        await $.get(flag_url, async function (flag_data, status) 
        {
            originalFlag = await flag_data.getElementsByTagName("svg")[0];
            answer = await data.name;
        });

        //erase the flag to start the game
        EraseFlagColors(attempts);
    });
});

//load all countries names to suggestions
$(document).ready(function () 
{
    $.get("https://flags-api-8ul8.onrender.com/names", function (country_data, status) 
    {
        suggestions = country_data;
        localStorage.setItem("suggestions", JSON.stringify(suggestions));
    }); 
});

$(function () {
    $("form").submit(function (e) {
        return false;
    });
})

$(function () {
    $("form").submit(function (e) {
        e.preventDefault();
        var guess = $("#input").val();

        SubmitGuess(guess);
    });
})

function LoadTips(jsonData)
{
    tips[0] = "Continent: " + jsonData.continente;
    tips[1] = "Capital: " + jsonData.capital;
    tips[2] = "Language: " + Object.values(jsonData.lingua);
    tips[3] = " ";
    tips[4] = " ";

    localStorage.setItem("tips", JSON.stringify(tips));
}

function SetFirstGameStatus()
{
    var attempts = 0;
    var maxAttempts = 5;

    localStorage.setItem("attempts", attempts);
    localStorage.setItem("maxAttempts", maxAttempts);
}

function SubmitGuess(guess) 
{
    var attempts = localStorage.getItem("attempts");
    var maxAttempts = localStorage.getItem("maxAttempts");

    if (guess.toLowerCase() == answer.toLowerCase())
    {
        alert("Congratulations! You guessed the right country!");
        EraseFlagColors(16);
    }
    else
    {
        attempts++;
        localStorage.setItem("attempts", attempts);
        EraseFlagColors(attempts);
        UpdateAttempts(guess);
        UpdateTips();
    }

    if (attempts >= maxAttempts)
    {
        alert("You have reached the maximum number of attempts. The right country was: " + answer);
        EraseFlagColors(16)
    }

    localStorage.setItem("attempts", attempts);
}

function UpdateAttempts(attempt) 
{
    var attempts = localStorage.getItem("attempts");
    
    //update text
    var attemptsDiv = document.getElementById("attempts");
    var text_num_attempts = attemptsDiv.getElementsByTagName("h3");
    text_num_attempts[0].innerHTML = "Attempts: " + attempts + "/ 5";

    //add new attempt
    var newAttempt = document.createElement("div");
    var country = document.createElement("p");
    country.innerHTML = attempt;
    
    newAttempt.className = "attempt";
    newAttempt.appendChild(country);
    attemptsDiv.appendChild(newAttempt);
}

function UpdateTips()
{
    var attempts = localStorage.getItem("attempts");

    //update text
    var tipsDiv = document.getElementById("tips");
    var text_num_tips = tipsDiv.getElementsByTagName("h3");
    text_num_tips[0].innerHTML = "Tips: " + attempts + "/ 4";

    //add new tip
    var tips = JSON.parse(localStorage.getItem("tips"));
    var newTip = document.createElement("div");
    var tip = document.createElement("p");
    tip.innerHTML = tips[attempts - 1];
    
    newTip.className = "tip";
    newTip.appendChild(tip);
    tipsDiv.appendChild(newTip);
}

function EraseFlagColors(num_colors) {
    erasedFlag = originalFlag.cloneNode(true);

    newFlag = EraseColors(new XMLSerializer().serializeToString(erasedFlag), num_colors);
    erasedFlag = new DOMParser().parseFromString(newFlag, "image/svg+xml").getElementsByTagName("svg")[0];

    flagDiv = document.getElementById("flag");
    flagDiv.removeChild(flagDiv.firstChild);
    flagDiv.appendChild(erasedFlag);
}

function EraseColors(rawflag, not_erase_num) {
    // iterate over all string and in any '#' character, replace the next 6 characters with 'ffffff'
    var i = 0;
    var flag = rawflag;
    var dict = {};
    while (i < flag.length) {
        if (flag[i] == '#') {
            end = i;
            while (flag[end] != "\"" && end < flag.length) {
                end++;
            }
            color = flag.substring(i, end)

            if (color.length != 7 && color.length != 4) {
                color = '#a'
            }

            if (dict[color]) {
                i++;
                continue;
            }

            if (Object.keys(dict).length < not_erase_num) {
                if (color != '#fff' && color != '#FFF' && color != '#ffffff' && color != '#FFFFFF') {
                    dict[color] = true;
                    console.log(color);
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