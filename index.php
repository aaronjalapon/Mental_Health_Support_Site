<?php
session_start();

// Function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Redirect to login for protected pages
function redirectToLogin() {
    header("Location: login.php");
    exit();
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MindCare - Mental Health Support</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Potta+One:wght@400&display=swap" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/langding_page.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header class="navbar">
      
        <div class="logo">
          <a href="index.php">
            <img class="logo-mindspace-1-1-icon" alt="" src="/images/Logo.svg">
            <h1>MindSpace</h1>
          </a>
        </div>
        <button class="burger-menu" id="burgerMenu">
          <!-- 3-bar lines icon -->
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <nav class="nav-links" id="navLinks">
          <a id="home" href="index.php">Home</a>
          <a id="about_us" href="#self-help">About us</a>
          <div class="dropdown">
            <button class="dropbtn">
              Self-Help
              <svg class="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
              </svg>
            </button>
            <div class="dropdown-content">
              <a href="#">Self-Help</a>
              <a href="#">Professional Support</a>
              <a href="#">Community</a>
            </div>
          </div>
          <!-- Replace login button with user dropdown -->
          <button id="btn-login" class="auth-button">Log In</button>
          <div class="user-dropdown" style="display: none;">

            <button class="dropdown-btn"> Welcome, Username</button>
            <div class="dropdown-logout">
              <a href="#" class="dropdown-item" onclick="handleLogout()">Profile</a>
              <a href="#" class="dropdown-item" onclick="handleLogout()">Logout</a>
            </div>


          </div>
        </nav>
      </header>

  <main>
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <p>Mental Health Support Site</p>
        <h1>Your Mental Health Matters</h1>
        <p>Discover resources, connect with professionals, and find community support in a safe and supportive space.</p>
        <button class="btn-get-started">Make an Appointment</button>
      </div>
    </section>

    <!-- Features Section -->
    <div class="what-we-offer">
      <p>What We Offer</p>
      <h2>Awareness today, better mental tomorrow</h2>
    </div>
    <section class="features">
      <div class="feature">
        <img id="guided-meditation" src="/images/guided-meditation.png" alt="Guided Meditation">
        <h2>Guided Meditations</h2>
        <p>Relax and recharge with our curated meditations.</p>
        <a href="#" class="feature-link">Explore</a>
      </div>
      <div class="feature">
        <img id="professional-support" src="/images/professional-support.png" alt="Professional Support">
        <h2>Professional Support</h2>
        <p>Connect with mental health professionals and resources.</p>
        <a href="#" class="feature-link">Learn More</a>
      </div>
      <div class="feature">
        <img id="community" src="/images/community.png">
        <h2>Community</h2>
        <p>Join a safe and supportive online space for peer support.</p>
        <a href="#" class="feature-link">Join Now</a>
      </div>
    </section>
    <section class="testimonials">
        <div class="client-testimonies">
            <h2>Client Testimonies</h2>
        </div>
        <div class="carousel-container">
            <button class="carousel-btn prev">❮</button>
            <div class="testimonial-cards" id="testimonialContainer">
                <?php
                require_once 'php/CRUDSettings/testimonial_functions.php';
                $testimonials = getPublicTestimonials();
                
                if (!empty($testimonials)): 
                    foreach ($testimonials as $testimonial): ?>
                        <div class="testimony">
                            <h2><?php echo htmlspecialchars($testimonial['username']); ?></h2>
                            <p><?php echo htmlspecialchars($testimonial['content']); ?></p>
                            <div class="rating">
                                <?php 
                                $rating = intval($testimonial['rating']);
                                echo str_repeat('★', $rating);
                                ?>
                            </div>
                        </div>
                    <?php endforeach;
                else: ?>
                    <!-- Fallback testimonials if no dynamic ones are available -->
                    <div class="testimony">
                        <h2>HearthFelt</h2>
                        <p>Found great support here. The community is amazing!</p>
                        <div class="rating">★★★★★</div>
                    </div>
                    <div class="testimony">
                        <h2>WarmIronheart</h2>
                        <p>The therapists are very professional and caring.</p>
                        <div class="rating">★★★★★</div>
                    </div>
                    <div class="testimony">
                        <h2>Peacefinder</h2>
                        <p>Life-changing experience. Highly recommended!</p>
                        <div class="rating">★★★★★</div>
                    </div>
                <?php endif; ?>
            </div>
            <button class="carousel-btn next">❯</button>
        </div>
    </section>
  </main>
  <footer class="footer">
    <p>© 2025 MindCare. All rights reserved. | <a href="#">Privacy Policy</a></p>
  </footer>
  <script src="js/landing_page.js"></script>
  
</body>
</html>