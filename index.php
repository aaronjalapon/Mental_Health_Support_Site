<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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
    <link rel="stylesheet" href="css/landing_page.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>

    <?php include 'components/header.php'; ?>

  <main>
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <p>Mental Health Support Site</p>
        <h1>Your Mental Health Matters</h1>
        <p>Discover resources, connect with professionals, and find community support in a safe and supportive space.</p>
        <button class="btn-get-started" onclick="redirectToAppointment()">Make an Appointment</button>
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
        <a href="#" onclick="redirectToAppointment()" class="feature-link">Learn More</a>
      </div>
      <div class="feature">
        <img id="community" src="/images/community.png">
        <h2>Community</h2>
        <p>Join a safe and supportive online space for peer support.</p>
        <a href="#" onclick="redirectToCommunity()" class="feature-link">Join Now</a>
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