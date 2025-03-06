<?php
session_start();
if(!isset($_SESSION['unique_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: ../html/login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings Management - MindSpace</title>
    <link rel="stylesheet" href="/css/admin_panel.css">
    <link rel="stylesheet" href="/css/settings_management.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <button class="mobile-toggle btn">
        <i class="fas fa-bars"></i>
    </button>
    <div class="admin-container">
        <?php include dirname(__DIR__) . '/components/admin_sidebar.php'; ?>
        <main class="main-content">
            <div class="settings-tabs">
                <button class="tab-btn active" data-tab="testimonials">
                    <i class="fas fa-quote-right"></i> Testimonials
                </button>
                <button class="tab-btn" data-tab="wordofday">
                    <i class="fas fa-book"></i> Word of the Day
                </button>
                <button class="tab-btn" data-tab="videos">
                    <i class="fas fa-video"></i> Meditation Videos
                </button>
            </div>

            <!-- Testimonials Section -->
            <div class="tab-content active" id="testimonialsContent">
                <div class="content-header">
                    <h1>Testimonial Management</h1>
                    <button class="btn btn-primary" id="addTestimonialBtn">
                        <i class="fas fa-plus"></i> Add New Testimonial
                    </button>
                </div>

                <div class="modal-overlay" id="testimonialForm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="formTitle">Add New Testimonial</h2>
                            <span class="close-modal" id="closeTestimonialBtn">&times;</span>
                        </div>
                        <div class="modal-body">
                            <form id="addTestimonialForm">
                                
                                <div class="form-group">
                                    <label class="form-label">Username</label>
                                    <input type="text" class="form-input" id="clientName" 
                                           placeholder="Enter username (first name only)" required>
                                    <small class="form-hint">For privacy, use first name or nickname only</small>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Testimonial Content</label>
                                    <textarea class="form-input" id="testimonialContent" rows="4" required 
                                        placeholder="Enter testimonial content (minimum 10 characters)"></textarea>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Rating</label>
                                    <select class="form-input" id="rating" required>
                                        <option value="5">★★★★★ (5)</option>
                                        <option value="4">★★★★ (4)</option>
                                        <option value="3">★★★ (3)</option>
                                        <option value="2">★★ (2)</option>
                                        <option value="1">★ (1)</option>
                                    </select>
                                </div>
                                <div class="modal-footer">
                                    <button type="submit" class="btn btn-primary">Save Testimonial</button>
                                    <button type="button" class="btn btn-secondary" id="cancelTestimonialBtn">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="testimonials-list">
                    <div class="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Testimonial</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="testimonialsTableBody">
                                <!-- Testimonials will be populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Word of the Day Section -->
            <div class="tab-content" id="wordofdayContent">
                <div class="content-header">
                    <h1>Word of the Day Management</h1>
                    <button class="btn btn-primary" id="addWordBtn">
                        <i class="fas fa-plus"></i> Add New Word
                    </button>
                </div>

                <div class="modal-overlay" id="wordForm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Add New Word</h2>
                            <span class="close-modal" id="closeWordBtn">&times;</span>
                        </div>
                        <div class="modal-body">
                            <form id="addWordForm">
                                <div class="form-group">
                                    <label class="form-label">Word</label>
                                    <input type="text" class="form-input" id="word" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Definition</label>
                                    <textarea class="form-input" id="definition" rows="3" required></textarea>
                                </div>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label class="form-label">Category</label>
                                        <select class="form-input" id="category" required>
                                            <option value="mental-health">Mental Health</option>
                                            <option value="wellness">Wellness</option>
                                            <option value="psychology">Psychology</option>
                                            <option value="mindfulness">Mindfulness</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Display Date</label>
                                        <input type="date" class="form-input" id="displayDate" required>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="submit" class="btn btn-primary">Save Word</button>
                                    <button type="button" class="btn btn-secondary" id="cancelWordBtn">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Word</th>
                                <th>Definition</th>
                                <th>Category</th>
                                <th>Display Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="wordTableBody">
                            <!-- Words will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="tab-content" id="videosContent">
                <div class="content-header">
                    <h1>Meditation Videos Management</h1>
                    <button class="btn btn-primary" id="addVideoBtn">
                        <i class="fas fa-plus"></i> Add New Video
                    </button>
                </div>

                <div class="modal-overlay" id="videoForm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="videoFormTitle">Add New Video</h2>
                            <span class="close-modal" id="closeVideoBtn">&times;</span>
                        </div>
                        <div class="modal-body">
                            <form id="addVideoForm">
                                <div class="form-group">
                                    <label class="form-label">Title</label>
                                    <input type="text" class="form-input" id="videoTitle" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">YouTube Link</label>
                                    <input type="text" class="form-input" id="videoId" required>
                                    <small class="form-hint">Enter the full YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)</small>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Category</label>
                                    <select class="form-input" id="videoCategory" required>
                                        <option value="beginner">Beginner's Guide</option>
                                        <option value="stress">Stress Relief</option>
                                        <option value="sleep">Sleep Meditation</option>
                                        <option value="mindfulness">Mindfulness Practice</option>
                                        <option value="anxiety">Anxiety Relief</option>
                                        <option value="focus">Focus & Concentration</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-input" id="videoDescription" rows="3" required></textarea>
                                </div>
                                <div class="modal-footer">
                                    <button type="submit" class="btn btn-primary">Save Video</button>
                                    <button type="button" class="btn btn-secondary" id="cancelVideoBtn">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Video Preview</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="videoTableBody">
                            <!-- Videos will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
    <script src="/js/landing_page.js"></script>
    <script src="/js/settings_management.js"></script>

</body>
</html>