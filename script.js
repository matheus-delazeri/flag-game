flag = null;
flagDiv = null;
tempFlag = null;
num_colors_to_erase = 0;

$(document).ready(function(){
    $.get("https://flagcdn.com/br.svg", function(data, status)
    {
        flagDiv = document.getElementById("flag");
        flag = data.getElementsByTagName("svg")[0];
        EraseFlagColors(num_colors_to_erase);
    });
});

function EraseElements(num_el)
{
    tempFlag = flag.cloneNode(true);
    
    //get all elements
    var childs = tempFlag.children;

    //remove all childs
    for(var i = num_el; i < childs.length; i++)
    {
        tempFlag.removeChild(childs[i]);
    }

    flagDiv.removeChild(flagDiv.firstChild);
    flagDiv.appendChild(tempFlag);

}

function EraseFlagColors(num_colors)
{
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

$(function(){
    $("form").submit(function(e){
        return false;
    });
})

function EraseColors(rawflag, not_erase_num)
{
    // iterate over all string and in any '#' character, replace the next 6 characters with 'ffffff'
    var i = 0;
    var flag = rawflag;
    var dict = {};
    while(i < flag.length)
    {
        if(flag[i] == '#')
        {
            end = i;
            while(flag[end] != "\"" && end < flag.length)
            {
                end++;
            }
            color = flag.substring(i, end)
            
            if(color.length != 7 && color.length != 4)
            {
                color = '#a'
            }

            if(dict[color])
            {
                i++;
                continue;
            }

            if(Object.keys(dict).length < not_erase_num)
            {
                if(color != '#fff' && color != '#FFF' && color != '#ffffff' && color != '#FFFFFF')
                {
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

$(function(){
    $("form").submit(function(e){
        num_colors_to_erase++;
        EraseFlagColors(num_colors_to_erase);
    });
})