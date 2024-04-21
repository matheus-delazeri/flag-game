var flag = null;
var flagDiv = null;
var tempFlag = null;
var num_colors_to_erase = 0;
var last_attempt = "";
var num_attempts = 0;
var max_num_attempts = 5;
var right_country = "";
// List of country names for suggestions
var countries = null;

$(document).ready(function () {
    $.get("https://flags-api-8ul8.onrender.com/random", async function (data, status) {
        flagDiv = document.getElementById("flag");
        flag_url = data.flag;
        console.log(flag_url);
        
        //acess the url and get the svg data
        await $.get(flag_url, async function (flag_data, status) 
        {
            flag = await flag_data.getElementsByTagName("svg")[0];
            right_country = await data.name;
        });

        await $.get("https://flags-api-8ul8.onrender.com/names", async function (country_data, status) 
        {
            countries = await country_data;
        }); 

        console.log(flag);
        EraseFlagColors(num_colors_to_erase);
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
        var value = $("#input").val();
        last_attempt = value;

        UpdateFlag();
    });
})

function UpdateFlag() 
{
    if (last_attempt.toLowerCase() == right_country.toLowerCase())
    {
        alert("Congratulations! You guessed the right country!");
        num_colors_to_erase = 10;
    }
    else
    {
        num_attempts++;
    }

    if (num_attempts >= max_num_attempts)
    {
        alert("You have reached the maximum number of attempts. The right country was: " + right_country);
        num_colors_to_erase = 10;
    }
    num_colors_to_erase++;
    EraseFlagColors(num_colors_to_erase);
    AppendAttemptsToHTML();
}



function AppendAttemptsToHTML() 
{
    var attemptsDiv = document.getElementById("attempts");
    var text_num_attempts = attemptsDiv.getElementsByTagName("h3");
    text_num_attempts[0].innerHTML = "Attempts: " + num_attempts + "/ 5";


    var newAttempt = document.createElement("div");
    var country = document.createElement("p");
    country.innerHTML = last_attempt;
    //add attempt class to newAttempt
    newAttempt.className = "attempt";
    newAttempt.appendChild(country);
    attemptsDiv.appendChild(newAttempt);
}

function EraseElements(num_el) {
    tempFlag = flag.cloneNode(true);

    //get all elements
    var childs = tempFlag.children;

    //remove all childs
    for (var i = num_el; i < childs.length; i++) {
        tempFlag.removeChild(childs[i]);
    }

    flagDiv.removeChild(flagDiv.firstChild);
    flagDiv.appendChild(tempFlag);

}

function EraseFlagColors(num_colors) {
    tempFlag = flag.cloneNode(true);
    /*  
      var paths = tempFlag.querySelectorAll("[fill]:not([fill='transparent']):not([fill='white']):not([fill='#fff']):not([fill='#FFF'])");
  
      for(var i = num_colors; i < paths.length; i++)
      {
          paths[i].setAttribute("fill", "white");
      }
  */

    newFlag = EraseColors(new XMLSerializer().serializeToString(tempFlag), num_colors);
    tempFlag = new DOMParser().parseFromString(newFlag, "image/svg+xml").getElementsByTagName("svg")[0];

    flagDiv.removeChild(flagDiv.firstChild);
    flagDiv.appendChild(tempFlag);
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
    const filteredCountries = countries.filter(country => country.toLowerCase().startsWith(query));

    // Display filtered countries
    filteredCountries.forEach(country => {
        const suggestion = document.createElement("div");
        suggestion.textContent = country;
        suggestion.onclick = () => {
            input.value = country;
            suggestions.innerHTML = "";

            last_attempt = country;
            UpdateFlag();
        };
        suggestions.appendChild(suggestion);
    });
}