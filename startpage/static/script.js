editing = false;

function editText (mynum, element)
{
    if (editing == false)
    {
        console.log(mynum);
        currentText = element.parentElement.children[0].textContent;
        element.parentElement.children[0].textContent = "";
        var input = document.createElement("input");
        input.type = "text";
        input.name = "newText"; // set the CSS class
        input.value = currentText;
        element.parentElement.prepend(input); // put it into the DOM

        buttons = document.getElementsByTagName("button")
        for (i = 0; i < buttons.length; i++)
        {
            console.log(typeof(button));
            if (!(buttons[i].value == mynum && buttons[i].name == "edit"))
            {
                buttons[i].style.display = "none";
            }
        }
        editing = true;
    } else {
        // Submit form
        buttons = document.getElementsByTagName("button")
        for (i = 0; i < buttons.length; i++)
        {
            console.log(typeof(button));
            if (buttons[i].value == mynum && buttons[i].name == "edit")
            {
                buttons[i].type = "submit";
            }
        }
    }
}