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

// Carousel functionality
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.testimonial-cards');
  const testimonies = [...document.querySelectorAll('.testimony')]; // Convert to array
  
  // Clone first and last items
  const firstSlides = testimonies.slice(0, 3);  // Clone first 3 slides
  const lastSlides = testimonies.slice(-3);      // Clone last 3 slides
  
  // Add clones to DOM
  lastSlides.forEach(slide => {
    const clone = slide.cloneNode(true);
    carousel.insertBefore(clone, carousel.firstChild);
  });
  
  firstSlides.forEach(slide => {
    const clone = slide.cloneNode(true);
    carousel.appendChild(clone);
  });

  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  
  let currentIndex = lastSlides.length; // Start after the cloned slides
  const slideWidth = testimonies[0].offsetWidth + 32; // Including gap

  // Initial position
  carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

  function moveToSlide(direction) {
    carousel.style.transition = 'transform 0.5s ease-in-out';
    
    if (direction === 'next') {
      currentIndex++;
    } else {
      currentIndex--;
    }
    
    carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }

  carousel.addEventListener('transitionend', () => {
    const slides = document.querySelectorAll('.testimony');
    
    // Reset to start when reaching end
    if (currentIndex >= slides.length - 3) {
      carousel.style.transition = 'none';
      currentIndex = lastSlides.length;
      carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }
    
    // Reset to end when reaching start
    if (currentIndex <= 2) {
      carousel.style.transition = 'none';
      currentIndex = slides.length - lastSlides.length - 3;
      carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }
  });

  // Event listeners
  nextBtn.addEventListener('click', () => moveToSlide('next'));
  prevBtn.addEventListener('click', () => moveToSlide('prev'));

  // Auto advance slides every 5 seconds
  setInterval(() => moveToSlide('next'), 3000);

  // Handle window resize
  window.addEventListener('resize', () => {
    const newSlideWidth = testimonies[0].offsetWidth + 32;
    carousel.style.transition = 'none';
    carousel.style.transform = `translateX(-${currentIndex * newSlideWidth}px)`;
  });
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
