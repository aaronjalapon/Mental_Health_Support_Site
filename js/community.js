// Post data structure
let posts = [];
let isLoading = false;
let currentPage = 1;
const postsPerPage = 5;

// Initialize the community features
document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    initializePosts();
    setupCreatePost();
    setupHeartReaction();
    setupComments();
    setupSidebarToggle();
});

function setupNavbar() {
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
}

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

function setupSidebarToggle() {
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        // Toggle icon between bars and times
        const icon = toggleBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    // Close sidebar when clicking overlay
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        const icon = toggleBtn.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
}

// Post creation
function setupCreatePost() {
    const createPostBtn = document.createElement('button');
    createPostBtn.className = 'create-post-btn';
    createPostBtn.innerHTML = 'Create Post';
    document.querySelector('.posts').prepend(createPostBtn);

    createPostBtn.addEventListener('click', () => {
        const postModal = `
            <div class="post-modal">
                <div class="post-modal-content">
                    <h3>Create a Post</h3>
                    <textarea id="post-content" placeholder="What's on your mind?"></textarea>
                    <button id="submit-post">Post</button>
                    <button id="cancel-post">Cancel</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', postModal);
        setupPostModalListeners();
    });
}

// Add these functions after setupCreatePost()
function setupPostModalListeners() {
    const modal = document.querySelector('.post-modal');
    const submitBtn = document.getElementById('submit-post');
    const cancelBtn = document.getElementById('cancel-post');
    const textarea = document.getElementById('post-content');

    submitBtn.addEventListener('click', () => {
        if (textarea.value.trim()) {
            submitPost(textarea.value.trim());
            closeModal(modal);
        }
    });

    cancelBtn.addEventListener('click', () => closeModal(modal));
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
}

function closeModal(modal) {
    modal.remove();
}

// Handle post creation
function submitPost(content) {
    const newPost = {
        id: Date.now(),
        content,
        author: 'Current User', // Replace with actual user
        timestamp: new Date(),
        votes: 0,
        hearts: 0,
        comments: [],
    };
    posts.unshift(newPost);
    renderPosts();
}

// Replace setupVoting with setupHeartReaction
function setupHeartReaction() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.heart-btn')) {
            const post = e.target.closest('[data-post-id]');
            const postId = post.dataset.postId;
            toggleHeart(postId);
        }
    });
}

function toggleHeart(postId) {
    const post = posts.find(p => p.id.toString() === postId.toString());
    if (post) {
        post.hearts = post.hearts ? 0 : 1; // Toggle between 0 and 1
        renderPosts();
    }
}

// Comment system
function setupComments() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.comment-btn')) {
            const post = e.target.closest('[data-post-id]');
            const postId = post.dataset.postId;
            toggleCommentSection(postId);
        }

        if (e.target.classList.contains('submit-comment')) {
            const post = e.target.closest('[data-post-id]');
            const postId = post.dataset.postId;
            const textarea = post.querySelector('.add-comment textarea');
            const content = textarea.value.trim();
            
            if (content) {
                addComment(postId, content);
                textarea.value = '';
            }
        }
    });
}

function toggleCommentSection(postId) {
    const post = document.querySelector(`[data-post-id="${postId}"]`);
    const commentSection = post.querySelector('.comments-section');
    
    if (commentSection.style.display === 'none') {
        commentSection.style.display = 'block';
        commentSection.querySelector('textarea').focus();
    } else {
        commentSection.style.display = 'none';
    }
}

function addComment(postId, content) {
    const post = posts.find(p => p.id.toString() === postId.toString());
    if (post) {
        post.comments.push({
            id: Date.now(),
            content,
            author: 'Current User', // Replace with actual user later
            timestamp: new Date()
        });
        renderPosts();
    }
}

// Render posts
function renderPosts(append = false) {
    const postsContainer = document.querySelector('.posts');
    const postsToShow = posts.slice(0, currentPage * postsPerPage);
    
    // Store create post button if it exists
    const createPostBtn = postsContainer.querySelector('.create-post-btn');
    
    const postsHTML = postsToShow.map(post => `
        <article class="post2" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-info">
                    <i class="circle-user-solid-1-icon fa-solid fa-circle-user"></i>
                    <b class="username">${post.author}</b>
                    <div class="div">${formatDate(post.timestamp)}</div>
                </div>
                <div class="post-options">
                    <button class="options-btn">
                        <i class="fas fa-ellipsis"></i>
                    </button>
                    <div class="options-dropdown">
                        <button class="report-btn">Report</button>
                    </div>
                </div>
            </div>
            <div class="post-content">
                <div class="post-text">${post.content}</div>
            </div>
            <div class="post-actions">
                <div class="actions-group">
                    <button class="heart-btn ${post.hearts ? 'active' : ''}">
                        <i class="fa-${post.hearts ? 'solid' : 'regular'} fa-heart"></i>
                        <span class="heart-count">${post.hearts || 0}</span>
                    </button>
                    <button class="comment-btn">
                        <i class="fa-regular fa-comment"></i>
                        <span>${post.comments.length} comments</span>
                    </button>
                </div>
            </div>
            <div class="comments-section" style="display: none;">
                <div class="comments-list">
                    ${renderComments(post.comments)}
                </div>
                <div class="add-comment">
                    <textarea placeholder="Add a comment"></textarea>
                    <button class="submit-comment">Comment</button>
                </div>
            </div>
        </article>
    `).join('');

    if (append) {
        // Remove loading indicator if it exists
        const loader = postsContainer.querySelector('.loader');
        if (loader) loader.remove();
        
        // Append new posts
        postsContainer.insertAdjacentHTML('beforeend', postsHTML);
    } else {
        // Clear container but preserve create post button if it exists
        postsContainer.innerHTML = '';
        
        // Re-add create post button if it existed
        if (createPostBtn) {
            postsContainer.appendChild(createPostBtn);
        }
        
        // Add posts
        postsContainer.insertAdjacentHTML('beforeend', postsHTML);
    }

    // Add loading indicator if there are more posts
    if (postsToShow.length < posts.length) {
        postsContainer.insertAdjacentHTML('beforeend', '<div class="loader"></div>');
    }
}

// Utility functions
function formatDate(date) {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
        return 'Just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return postDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

function renderComments(comments) {
    return comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <i class="fa-solid fa-user"></i>
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${formatDate(comment.timestamp)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
}

// Add comment event listener to the post rendering
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('submit-comment')) {
        const post = e.target.closest('[data-post-id]');
        const postId = post.dataset.postId;
        const textarea = post.querySelector('.add-comment textarea');
        const content = textarea.value.trim();
        
        if (content) {
            const postIndex = posts.findIndex(p => p.id.toString() === postId);
            if (postIndex !== -1) {
                const newComment = {
                    id: Date.now(),
                    content,
                    author: 'Current User',
                    timestamp: new Date()
                };
                posts[postIndex].comments.push(newComment);
                
                // Update comment count
                const commentCount = post.querySelector('.comment-btn span');
                commentCount.textContent = `${posts[postIndex].comments.length} comments`;
                
                // Add new comment to DOM
                const commentsList = post.querySelector('.comments-list');
                const commentHTML = `
                    <div class="comment">
                        <div class="comment-header">
                            <i class="fa-solid fa-user"></i>
                            <span class="comment-author">${newComment.author}</span>
                            <span class="comment-date">${formatDate(newComment.timestamp)}</span>
                        </div>
                        <div class="comment-content">${newComment.content}</div>
                    </div>
                `;
                commentsList.insertAdjacentHTML('beforeend', commentHTML);
                
                // Clear textarea
                textarea.value = '';
            }
        }
    }
});

// Add this after other event listeners
document.addEventListener('click', (e) => {
    // Close all dropdowns when clicking outside
    if (!e.target.closest('.post-options')) {
        document.querySelectorAll('.options-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
    
    // Toggle dropdown when clicking options button
    if (e.target.closest('.options-btn')) {
        const dropdown = e.target.closest('.post-options').querySelector('.options-dropdown');
        dropdown.classList.toggle('show');
    }

    // Handle report button click
    if (e.target.classList.contains('report-btn')) {
        const postId = e.target.closest('[data-post-id]').dataset.postId;
        handleReport(postId);
    }
});

function handleReport(postId) {
    const reportModal = `
        <div class="report-modal">
            <div class="report-modal-content">
                <h3>Report Post</h3>
                <form id="report-form">
                    <div class="form-group">
                        <label for="report-reason">Reason for reporting:</label>
                        <select id="report-reason" required>
                            <option value="">Select a reason</option>
                            <option value="harassment">Harassment or Bullying</option>
                            <option value="harmful_content">Harmful Content</option>
                            <option value="misinformation">Misinformation</option>
                            <option value="hate_speech">Hate Speech</option>
                            <option value="violence">Violence</option>
                            <option value="spam">Spam</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="report-description">Additional details:</label>
                        <textarea id="report-description" placeholder="Please provide more details about your report..." rows="4"></textarea>
                    </div>
                    <div class="report-actions">
                        <button type="button" class="btn-secondary" id="cancel-report">Cancel</button>
                        <button type="submit" class="btn-primary" id="submit-report">Submit Report</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', reportModal);
    setupReportModalListeners(postId);
}

function setupReportModalListeners(postId) {
    const modal = document.querySelector('.report-modal');
    const form = document.getElementById('report-form');
    const cancelBtn = document.getElementById('cancel-report');

    cancelBtn.addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const reason = document.getElementById('report-reason').value;
        const description = document.getElementById('report-description').value;

        if (!reason) {
            alert('Please select a reason for reporting');
            return;
        }

        submitReport(postId, reason, description);
        modal.remove();
    });
}

function submitReport(postId, reason, description) {
    // Here you would typically send the report to your backend
    console.log('Report submitted:', { postId, reason, description });
    
    // Show confirmation to user
    alert('Thank you for your report. Our moderators will review it shortly.');
    
    // Store report in localStorage for demo purposes
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    reports.push({
        id: Date.now(),
        postId,
        reason,
        description,
        timestamp: new Date(),
        status: 'pending'
    });
    localStorage.setItem('reports', JSON.stringify(reports));
}

// Initialize with sample data
function initializePosts() {
    posts = [
        {
            id: 1,
            content: "Welcome to our mental health community! Share your thoughts and experiences in a safe and supportive environment. Remember, you're not alone in this journey. 💚",
            author: "MindSpace_Admin",
            timestamp: new Date(),
            hearts: 5,
            comments: [
                {
                    id: 101,
                    content: "Thank you for creating this space! It's so important to have a place where we can openly discuss mental health.",
                    author: "User123",
                    timestamp: new Date(Date.now() - 30 * 60 * 1000)
                },
                {
                    id: 102,
                    content: "Looking forward to connecting with others and sharing experiences. Together we are stronger! 🌟",
                    author: "WellnessJourney",
                    timestamp: new Date(Date.now() - 25 * 60 * 1000)
                }
            ]
        },
        {
            id: 2,
            content: "Today I learned a new meditation technique called '4-7-8 breathing'. Has anyone tried mindful breathing exercises? They really help with anxiety! Would love to hear your experiences. 🧘‍♀️",
            author: "WellnessSeeker",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            hearts: 3,
            comments: [
                {
                    id: 201,
                    content: "Yes! Breathing exercises have been a game-changer for my anxiety. I use them every morning!",
                    author: "MindfulMoments",
                    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
                },
                {
                    id: 202,
                    content: "Could you share more details about the 4-7-8 technique? I'm interested in learning more.",
                    author: "NewToMeditation",
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
                }
            ]
        },
        {
            id: 3,
            content: "Just completed my first therapy session today. Feeling nervous but hopeful. It's okay to ask for help when you need it. 💫",
            author: "HealingStep",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            hearts: 7,
            comments: [
                {
                    id: 301,
                    content: "So proud of you for taking this step! The first session is always the hardest. It gets better! 💕",
                    author: "SupportiveSoul",
                    timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000)
                }
            ]
        }
    ];
    
    currentPage = 1;
    renderPosts();
    setupInfiniteScroll();
}

function setupInfiniteScroll() {
    const handleScroll = () => {
        if (isLoading) return;

        const postsContainer = document.querySelector('.posts');
        const containerBottom = postsContainer.getBoundingClientRect().bottom;
        const isNearBottom = containerBottom <= window.innerHeight + 100; // 100px threshold

        if (isNearBottom && currentPage * postsPerPage < posts.length) {
            loadMorePosts();
        }
    };

    // Throttle scroll event
    let timeout;
    window.addEventListener('scroll', () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(handleScroll, 100);
    });
}

function loadMorePosts() {
    isLoading = true;
    
    // Simulate loading delay
    setTimeout(() => {
        currentPage++;
        renderPosts(true);
        isLoading = false;
    }, 500);
}