// Select the burger menu button and navigation links
const burgerMenu = document.getElementById("burgerMenu");
const navLinks = document.getElementById("navLinks");

// Add an event listener for click events
burgerMenu.addEventListener("click", () => {
  burgerMenu.classList.toggle("active");
  navLinks.classList.toggle("show"); // Toggle the 'show' class
});

// Setup intersection observer for animations
const observerOptions = {
  threshold: 0.2,
  rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Stop observing once animated
    }
  });
}, observerOptions);

// Observe features
document.addEventListener('DOMContentLoaded', () => {
  // Observe what-we-offer section
  const whatWeOffer = document.querySelector('.what-we-offer');
  if (whatWeOffer) observer.observe(whatWeOffer);
  
  // Observe all feature elements
  const features = document.querySelectorAll('.feature');
  features.forEach(feature => observer.observe(feature));
});

const oberserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    console.log(entry)
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
    }else{
      entry.target.classList.remove('animate');
    }
  });
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((element) => 
  oberserver.observe(element));
