<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>

<link rel="stylesheet" href="/css/header.css">

<header class="navbar">
    <div class="logo">
        <a href="/index.php">
            <img class="logo-mindspace-1-1-icon" alt="" src="/images/Logo.svg">
            <h1>MindSpace</h1>
        </a>
    </div>
    <button class="burger-menu" id="burgerMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
    </button>
    <nav class="nav-links" id="navLinks">
        <a id="home" href="/index.php">Home</a>
        <a id="about_us" href="/html/about.php">About us</a>
        <div class="dropdown">
            <button class="dropbtn">
                Self-Help
                <svg class="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
                </svg>
            </button>
            <div class="dropdown-content">
                <a href="#" onclick="redirectToGuidedMeditations()">Guided Meditation</a>
                <a href="#" onclick="redirectToAppointment()" >Professional Support</a>
                <a href="#" onclick="redirectToCommunity()">Community</a>
            </div>
        </div>
        
        <!-- Unified Authentication Section -->
        <button id="btn-login" class="auth-button" style="display: none;">Log In</button>
        <div class="user-dropdown" style="display: none;">
            <button class="dropdown-btn">
                <i class="fas fa-user"></i> Welcome
            </button>
            <div class="dropdown-logout">
                <a href="#" class="dropdown-item">Profile</a>
                <a href="#" class="dropdown-item logout-link">Logout</a>
            </div>
        </div>
    </nav>
</header>

<!-- Edit Profile Modal -->
<div id="editProfileModal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Edit Profile</h2>
            <span class="close-modal">&times;</span>
        </div>
        <div class="modal-body">
            <form id="editProfileForm">
                <input type="hidden" id="profileId" name="profileId">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="editFirstName">First Name</label>
                        <input type="text" class="form-input" id="editFirstName" name="firstName" required>
                    </div>
                    <div class="form-group">
                        <label for="editLastName">Last Name</label>
                        <input type="text" class="form-input" id="editLastName" name="lastName" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="editUsername">Username</label>
                    <input type="text" class="form-input" id="editUsername" name="username" required>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="editContact">Contact Number</label>
                        <input type="tel" class="form-input" id="editContact" name="contact" required>
                    </div>
                    <div class="form-group">
                        <label for="editPronouns">Pronouns</label>
                        <select class="form-input" id="editPronouns" name="pronouns" required>
                            <option value="He/Him/His">He/Him/His</option>
                            <option value="She/Her/Hers">She/Her/Hers</option>
                            <option value="They/Them/Theirs">They/Them/Theirs</option>
                            <option value="I prefer not to say">I prefer not to say</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="editAddress">Address</label>
                    <input type="text" class="form-input" id="editAddress" name="address" required>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                    <button type="button" class="btn btn-secondary edit-cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="/js/header.js"></script>
