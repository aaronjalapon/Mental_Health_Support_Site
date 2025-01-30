// Select the burger menu button and navigation links
const burgerMenu = document.getElementById("burgerMenu");
const navLinks = document.getElementById("navLinks");

// Add an event listener for click events
burgerMenu.addEventListener("click", () => {
  burgerMenu.classList.toggle("active");
  navLinks.classList.toggle("show"); // Toggle the 'show' class
});
