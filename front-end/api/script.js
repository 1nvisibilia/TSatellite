// Dom Elements
const navBtns = document.getElementsByClassName("navBtn");

function initialize() {
   // Assign animations to the navigation bar buttons.
   for (let i = 0; i < navBtns.length; i++) {
      navBtns[i].style.transition = "border 0.5s, color 0.5s";
   }

   hljs.highlightAll();
}

initialize();
