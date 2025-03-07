<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us - MindSpace</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Potta+One:wght@400&display=swap" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/about.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/components/header.php'; ?>
   
    <main>
        <section class="hero">
            <div class="hero-content">
                <h1>About MindSpace</h1>
                <p>Empowering Mental Wellness Through Community and Support</p>
            </div>
        </section>

        <section class="mission">
            <div class="container">
                <h2>Our Mission</h2>
                <p>At MindSpace, we believe that mental health support should be accessible to everyone. Our mission is to create a safe, supportive environment where individuals can find resources, connect with professionals, and build community on their mental wellness journey.</p>
            </div>
        </section>

        <section class="values">
            <div class="container">
                <h2>Our Values</h2>
                <div class="values-grid">
                    <div class="value-card">
                        <i class="fas fa-heart"></i>
                        <h3>Compassion</h3>
                        <p>We approach every interaction with empathy and understanding.</p>
                    </div>
                    <div class="value-card">
                        <i class="fas fa-lock"></i>
                        <h3>Safety</h3>
                        <p>Your privacy and security are our top priorities.</p>
                    </div>
                    <div class="value-card">
                        <i class="fas fa-hands-helping"></i>
                        <h3>Support</h3>
                        <p>We're committed to providing quality mental health resources.</p>
                    </div>
                    <div class="value-card">
                        <i class="fas fa-users"></i>
                        <h3>Community</h3>
                        <p>Building connections and fostering a supportive environment.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="team">
            <div class="container">
                <h2>Our Team</h2>
                <div class="team-grid">
                    <div class="team-member">
                        <img src="/images/team/team-1.jpg" alt="Dr. Sarah Johnson">lt="Dr. Sarah Johnson">
                        <h3>Dr. Sarah Johnson</h3>
                        <p>Clinical Director</p>
                    </div>
                    <div class="team-member">
                        <img src="/images/team/team-2.jpg" alt="Michael Chen">hael Chen">
                        <h3>Michael Chen</h3>
                        <p>Community Manager</p>
                    </div>
                    <div class="team-member">
                        <img src="/images/team/team-3.jpg" alt="Dr. Emily Parker"> Emily Parker">
                        <h3>Dr. Emily Parker</h3>
                        <p>Lead Therapist</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>About MindSpace</h3>
                <ul>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Our Team</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Services</h3>
                <ul>
                    <li><a href="#">Guided Meditation</a></li>
                    <li><a href="#">Professional Support</a></li>
                    <li><a href="#">Community Forum</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Connect With Us</h3>
                <p>Follow us on social media</p>
                <div class="social-links">
                    <a href="#"><i class="fab fa-facebook"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-linkedin"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 MindSpace. All rights reserved.</p>
        </div>
    </footer>
    <script src="../js/about.js"></script>
</body>
</html>
