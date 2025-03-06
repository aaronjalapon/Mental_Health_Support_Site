// window.scrollTo(0, 0);

// document.addEventListener('DOMContentLoaded', function() {
//     window.scrollTo(0, 0);  

//     // Burger menu functionality
//     const burgerMenu = document.getElementById("burgerMenu");
//     const navLinks = document.getElementById("navLinks");
//     const selfHelpBtn = document.querySelector('.dropbtn');
//     const dropdownContent = document.querySelector('.dropdown-content');

//     if (burgerMenu && navLinks) {
//         burgerMenu.addEventListener("click", () => {
//             burgerMenu.classList.toggle("active");
//             navLinks.classList.toggle("show");
//         });
//     }

//     // Self-help dropdown toggle
//     if (selfHelpBtn) {
//         selfHelpBtn.addEventListener('click', (e) => {
//             e.stopPropagation();
//             dropdownContent.classList.toggle('show');
//         });
//     }

//     // Close self-help dropdown when clicking outside
//     window.addEventListener('click', (event) => {
//         if (!event.target.matches('.dropbtn')) {
//             if (dropdownContent?.classList.contains('show')) {
//                 dropdownContent.classList.remove('show');
//             }
//         }
//     });

//     // Setup intersection observer for animations
//     const observerOptions = {
//         threshold: 0.2,
//         rootMargin: "0px"
//     };

//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 entry.target.classList.add('visible');
//                 observer.unobserve(entry.target); // Stop observing once animated
//             }
//         });
//     }, observerOptions);

//     const oberserver = new IntersectionObserver((entries) => {
//         entries.forEach((entry) => {
//             console.log(entry)
//             if (entry.isIntersecting) {
//                 entry.target.classList.add('animate');
//             } else {
//                 entry.target.classList.remove('animate');
//             }
//         });
//     });

//     const hiddenElements = document.querySelectorAll('.hidden');
//     hiddenElements.forEach((element) =>
//         oberserver.observe(element));

//     // Authentication elements
//     const authButton = document.getElementById('btn-login');
//     const userDropdown = document.querySelector('.user-dropdown');
//     const dropdownBtn = document.querySelector('.dropdown-btn');
//     const dropdownContent = document.querySelector('.dropdown-content');

//     // Check session status when page loads
//     checkSession();

//     // Handle auth button click
//     if (authButton) {
//         authButton.addEventListener('click', function() {
//             if (authButton.textContent === 'Log In') {
//                 window.location.href = '/html/login.php';
//             }
//         });
//     }

//     // Handle dropdown button click
//     if (dropdownBtn) {
//         dropdownBtn.addEventListener('click', (e) => {
//             e.stopPropagation();
//             document.querySelector('.dropdown-logout').classList.toggle('show');
//         });
//     }

//     // Close dropdown when clicking outside
//     window.addEventListener('click', (event) => {
//         if (!userDropdown?.contains(event.target)) {
//             const dropdownLogout = document.querySelector('.dropdown-logout');
//             if (dropdownLogout?.classList.contains('show')) {
//                 dropdownLogout.classList.remove('show');
//             }
//         }
//     });

//     // Add dropdown toggle functionality
//     dropdownBtn?.addEventListener('click', () => {
//         dropdownContent.classList.toggle('show');
//     });

//     // Close dropdown when clicking outside
//     window.addEventListener('click', (event) => {
//         if (!event.target.matches('.dropdown-btn')) {
//             if (dropdownContent?.classList.contains('show')) {
//                 dropdownContent.classList.remove('show');
//             }
//         }
//     });

//     // Add event listeners for logout
//     const logoutLinks = document.querySelectorAll('.logout-link');
//     logoutLinks.forEach(link => {
//         link.addEventListener('click', handleLogout);
//     });

//     const dropdownLogout = document.querySelector('.dropdown-logout a[onclick*="handleLogout"]');
//     if (dropdownLogout) {
//         dropdownLogout.addEventListener('click', handleLogout);
//     }
// });

// // Session checking function
// function checkSession() {
//     fetch('/php/check_session.php')
//         .then(response => response.json())
//         .then(data => {
//             const authButton = document.getElementById('btn-login');
//             const userDropdown = document.querySelector('.user-dropdown');
            
//             if (data.loggedIn) {
//                 authButton.style.display = 'none';
//                 userDropdown.style.display = 'block';
                
//                 const username = data.user.username;
//                 const dropdownBtn = document.querySelector('.dropdown-btn');
//                 dropdownBtn.innerHTML = `<i class="fas fa-user"></i> Welcome, ${username}`;
//             } else {
//                 authButton.style.display = 'block';
//                 userDropdown.style.display = 'none';
//             }
//         })
//         .catch(error => console.error('Error:', error));
// }

// // Logout handling
// function handleLogout(event) {
//     if (event) {
//         event.preventDefault();
//     }
    
//     fetch('/php/logout.php')
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 window.location.href = '/index.php';
//             } else {
//                 throw new Error(data.message || 'Logout failed');
//             }
//         })
//         .catch(error => {
//             console.error('Logout error:', error);
//             alert('Logout failed. Please try again.');
//             window.location.href = '/index.php';
//         });
// }

// function redirectToCommunity() {
//     fetch('/php/check_session.php')
//         .then(response => response.json())
//         .then(data => {
//             if (data.loggedIn) {
//                 window.location.href = '/html/community.php';
//             } else {
//                 window.location.href = '/html/login.php';
//                 alert('Please log in first.');
//             }
//         })
//         .catch(error => console.error('Error:', error));
// }
