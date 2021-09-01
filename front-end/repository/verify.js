// The path http://hostname/repository shouldnt be access without the route parameter.
// If the user ever attemp to do so, send the user back to the home page.

if (window.location.pathname == "/repository/" ||
   window.location.pathname == "/repository") {
   window.open("/", "_self");
}
