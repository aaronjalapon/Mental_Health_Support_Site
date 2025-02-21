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



document.addEventListener('DOMContentLoaded', function() {
  const authButton = document.getElementById('btn-login');
  const userDropdown = document.querySelector('.user-dropdown');
  const dropdownBtn = document.querySelector('.dropdown-btn');
  const dropdownContent = document.querySelector('.dropdown-content');

  // Check session status when page loads
  checkSession();

  // Handle auth button click
  authButton.addEventListener('click', function() {
      if (authButton.textContent === 'Log In') {
          window.location.href = '/html/login.html';
      } else {
          logout();
      }
  });

  // Handle dropdown button click
  dropdownBtn.addEventListener('click', () => {
      dropdownContent.classList.toggle('show');
  });

  // Close the dropdown when clicking outside
  window.addEventListener('click', (event) => {
      if (!event.target.matches('.dropdown-btn')) {
          if (dropdownContent.classList.contains('show')) {
              dropdownContent.classList.remove('show');
          }
      }
  });
});

// Add dropdown toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');

    dropdownBtn?.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', (event) => {
        if (!event.target.matches('.dropdown-btn')) {
            if (dropdownContent?.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });
});

//THIS IS FOR CHECKING SESSION FOR LOGIN OKAAAAAy

/* filepath: /d:/Backend/Mental_Health_Support_Site/js/landing_page.js */
function checkSession() {
  fetch('/php/check_session.php')
      .then(response => response.json())
      .then(data => {
          const authButton = document.getElementById('btn-login');
          const userDropdown = document.querySelector('.user-dropdown');
          const dropdownLogout = document.querySelector('.dropdown-logout');
          
          if (data.loggedIn) {
              // Hide login button and show user dropdown
              authButton.style.display = 'none';
              userDropdown.style.display = 'block';
              
              // Update welcome message with user's name
              const username = `${data.user.username}`;
              const dropdownBtn = document.querySelector('.dropdown-btn');
              dropdownBtn.innerHTML = `<i class="fas fa-user"></i> Welcome, ${username}`;
              
              // Setup dropdown toggle
              dropdownBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  dropdownLogout.classList.toggle('show');
              });

              // Close dropdown when clicking outside
              document.addEventListener('click', (e) => {
                  if (!userDropdown.contains(e.target)) {
                      dropdownLogout.classList.remove('show');
                  }
              });
          } else {
              authButton.style.display = 'block';
              userDropdown.style.display = 'none';
          }
      })
      .catch(error => console.error('Error:', error));
}

// Update the handleLogout function
function handleLogout(event) {
    if (event) {
        event.preventDefault();
    }
    
    fetch('/php/logout.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Clear any stored session data
                sessionStorage.clear();
                localStorage.clear();
                
                // Update UI if on main site
                const userDropdown = document.querySelector('.user-dropdown');
                const loginButton = document.getElementById('btn-login');
                if (userDropdown && loginButton) {
                    userDropdown.style.display = 'none';
                    loginButton.style.display = 'block';
                }
                
                // Redirect to landing page
                window.location.href = '/index.html';
            } else {
                throw new Error(data.message || 'Logout failed');
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
            // Redirect anyway as fallback
            window.location.href = '/index.html';
        });
}

// Add event listeners for logout
document.addEventListener('DOMContentLoaded', function() {
    // For admin panel logout links
    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', handleLogout);
    });
    
    // For main site logout
    const dropdownLogout = document.querySelector('.dropdown-logout a[onclick*="handleLogout"]');
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', handleLogout);
    }
});