window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo(0, 0);  
    // Add null checks before accessing elements
    const burgerMenu = document.getElementById("burgerMenu");
    const navLinks = document.getElementById("navLinks");

    if (burgerMenu && navLinks) {
        burgerMenu.addEventListener("click", () => {
            burgerMenu.classList.toggle("active");
            navLinks.classList.toggle("show");
        });
    }

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
    const whatWeOffer = document.querySelector('.what-we-offer');
    if (whatWeOffer) observer.observe(whatWeOffer);

    // Observe all feature elements
    const features = document.querySelectorAll('.feature');
    features.forEach(feature => observer.observe(feature));

    // Carousel functionality
    initializeCarousel();

    const oberserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            console.log(entry)
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            } else {
                entry.target.classList.remove('animate');
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((element) =>
        oberserver.observe(element));

    const authButton = document.getElementById('btn-login');
    const userDropdown = document.querySelector('.user-dropdown');
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.querySelector('.dropdown-content');

    // Check session status when page loads
    checkSession();

    // Handle auth button click
    authButton.addEventListener('click', function () {
        if (authButton.textContent === 'Log In') {
            window.location.href = '/html/login.php';
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

    // Add dropdown toggle functionality
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

    // Add event listeners for logout
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

    // Update carousel functionality
    function initializeCarousel() {
        const carousel = document.querySelector('.testimonial-cards');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        
        if (!carousel || !prevBtn || !nextBtn) return;

        let testimonies = [...document.querySelectorAll('.testimony')];
        if (testimonies.length === 0) return;

        // Ensure minimum number of slides for smooth carousel
        const minSlides = 3;
        if (testimonies.length < minSlides) {
            const slidesToAdd = minSlides - testimonies.length;
            for (let i = 0; i < slidesToAdd; i++) {
                const clone = testimonies[i % testimonies.length].cloneNode(true);
                carousel.appendChild(clone);
            }
            testimonies = [...document.querySelectorAll('.testimony')];
        }

        // Create clones for infinite scroll
        const slidesToClone = 3;
        const firstSlides = testimonies.slice(0, slidesToClone);
        const lastSlides = testimonies.slice(-slidesToClone);

        // Add clones
        lastSlides.forEach(slide => {
            const clone = slide.cloneNode(true);
            carousel.insertBefore(clone, carousel.firstChild);
        });

        firstSlides.forEach(slide => {
            const clone = slide.cloneNode(true);
            carousel.appendChild(clone);
        });

        // Initialize carousel position
        testimonies = [...document.querySelectorAll('.testimony')];
        let currentIndex = slidesToClone;
        const slideWidth = testimonies[0].offsetWidth + 32; // Width + gap

        carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        // Smooth scroll function
        function moveCarousel(direction) {
            carousel.style.transition = 'transform 0.5s ease-in-out';
            if (direction === 'next') {
                currentIndex++;
            } else {
                currentIndex--;
            }
            carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        }

        // Handle infinite scroll transitions
        carousel.addEventListener('transitionend', () => {
            // Reset to beginning when reaching end
            if (currentIndex >= testimonies.length - slidesToClone) {
                carousel.style.transition = 'none';
                currentIndex = slidesToClone;
                carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            }
            // Reset to end when reaching beginning
            if (currentIndex <= slidesToClone - 1) {
                carousel.style.transition = 'none';
                currentIndex = testimonies.length - slidesToClone - 1;
                carousel.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            }
        });

        // Button controls
        prevBtn.addEventListener('click', () => moveCarousel('prev'));
        nextBtn.addEventListener('click', () => moveCarousel('next'));

        // Auto-scroll functionality
        let autoScroll = setInterval(() => moveCarousel('next'), 4000);

        // Pause auto-scroll on hover
        carousel.addEventListener('mouseenter', () => clearInterval(autoScroll));
        carousel.addEventListener('mouseleave', () => {
            autoScroll = setInterval(() => moveCarousel('next'), 4000);
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            const newSlideWidth = testimonies[0].offsetWidth + 32;
            carousel.style.transition = 'none';
            carousel.style.transform = `translateX(-${currentIndex * newSlideWidth}px)`;
        });
    }

    // Initialize carousel after content is loaded
    document.addEventListener('DOMContentLoaded', initializeCarousel);

    // Reinitialize carousel if dynamic content changes
    function reinitializeCarousel() {
        const carousel = document.querySelector('.testimonial-cards');
        if (carousel) {
            // Remove all cloned slides
            const originalSlides = carousel.querySelectorAll('.testimony:not(.clone)');
            carousel.innerHTML = '';
            originalSlides.forEach(slide => carousel.appendChild(slide.cloneNode(true)));
            
            // Reinitialize the carousel
            initializeCarousel();
        }
    }
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
                window.location.href = '/index.php';
            } else {
                throw new Error(data.message || 'Logout failed');
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
            // Redirect anyway as fallback
            window.location.href = '/index.php';
        });
}

