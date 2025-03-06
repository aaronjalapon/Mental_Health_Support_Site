window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo(0, 0);  

    // Setup intersection observer for animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: "0px"
    };

    // Keep animation observers
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe features
    const whatWeOffer = document.querySelector('.what-we-offer');
    if (whatWeOffer) observer.observe(whatWeOffer);

    const features = document.querySelectorAll('.feature');
    features.forEach(feature => observer.observe(feature));

    // Keep carousel functionality
    initializeCarousel();

    const oberserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
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

    // Keep carousel functions
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
});


