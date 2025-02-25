document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadData();
    setupEventListeners();
});

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab-btn, .tab-content').forEach(el => {
                el.classList.remove('active');
            });
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
            
            // Load data for the active tab
            loadData(tab.dataset.tab);
        });
    });
}

function loadData(tab = 'posts') {
    // Simulated data - replace with actual API calls
    switch(tab) {
        case 'posts':
            loadPosts();
            break;
        case 'users':
            loadUsers();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

function loadPosts() {
    // Enhanced sample data with more details
    const posts = [
        {
            id: 1,
            author: "JohnDoe",
            content: "This is a sample post discussing mental health awareness...",
            date: "2024-01-15",
            status: "active",
            flags: 2,
            reports: ["Inappropriate content", "Misinformation"],
            likes: 15,
            comments: 5
        },
        {
            id: 2,
            author: "JaneSmith",
            content: "Sharing my journey with anxiety and the coping mechanisms...",
            date: "2024-01-14",
            status: "flagged",
            flags: 1,
            reports: ["Sensitive content"],
            likes: 32,
            comments: 8
        }
        // Add more sample posts
    ];

    const postsContainer = document.querySelector('.posts-list');
    postsContainer.innerHTML = posts.map(post => `
        <div class="post-item" data-id="${post.id}" data-status="${post.status}">
            <div class="post-header">
                <div class="post-info">
                    <span class="post-author">${post.author}</span>
                    <span class="post-date">${formatDate(post.date)}</span>
                    <span class="post-status status-${post.status}">${post.status}</span>
                </div>
                ${post.flags > 0 ? `<div class="flag-count"><i class="fas fa-flag"></i> ${post.flags}</div>` : ''}
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-stats">
                <span><i class="fas fa-heart"></i> ${post.likes}</span>
                <span><i class="fas fa-comment"></i> ${post.comments}</span>
            </div>
            ${post.reports ? `
                <div class="post-reports">
                    <h4>Reports:</h4>
                    <ul>
                        ${post.reports.map(report => `<li>${report}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            <div class="post-actions">
                <button class="btn btn-warning" onclick="reviewPost(${post.id})">
                    <i class="fas fa-eye"></i> Review
                </button>
                <button class="btn btn-secondary" onclick="togglePostVisibility(${post.id})">
                    <i class="fas fa-eye${post.status === 'hidden' ? '-slash' : ''}"></i>
                    ${post.status === 'hidden' ? 'Show' : 'Hide'}
                </button>
                <button class="btn btn-danger" onclick="deletePost(${post.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function loadUsers() {
    const users = [
        {
            id: 1,
            name: "John Doe",
            status: "active",
            joinDate: "2024-01-01",
            posts: 15,
            reports: 0
        },
        // Add more sample users
    ];

    const usersContainer = document.querySelector('.users-list');
    usersContainer.innerHTML = users.map(user => `
        <div class="user-item" data-id="${user.id}">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-stats">
                    <span>${user.posts} posts</span> • 
                    <span>Joined ${formatDate(user.joinDate)}</span>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn btn-secondary" onclick="toggleUserStatus(${user.id})">
                    ${user.status === 'suspended' ? 'Activate' : 'Suspend'}
                </button>
                <button class="btn btn-danger" onclick="banUser(${user.id})">
                    Ban User
                </button>
            </div>
        </div>
    `).join('');
}

function loadReports() {
    const reports = [
        {
            id: 1,
            type: "Post",
            contentId: 123,
            content: "Inappropriate content discussing harmful behaviors",
            reporter: "User123",
            date: "2024-01-15",
            status: "pending",
            category: "harmful_content",
            urgency: "high",
            additionalInfo: "Contains triggering content"
        },
        {
            id: 2,
            type: "Comment",
            contentId: 456,
            content: "Harassing comment towards another user",
            reporter: "User456",
            date: "2024-01-14",
            status: "under_review",
            category: "harassment",
            urgency: "medium",
            additionalInfo: "Multiple users have reported this"
        }
        // Add more sample reports
    ];

    const reportsContainer = document.querySelector('.reports-list');
    reportsContainer.innerHTML = reports.map(report => `
        <div class="report-item" data-id="${report.id}" data-status="${report.status}">
            <div class="report-header">
                <div class="report-info">
                    <span class="report-type">${report.type} Report</span>
                    <span class="report-status status-${report.status}">${formatReportStatus(report.status)}</span>
                    <span class="report-urgency urgency-${report.urgency}">${report.urgency}</span>
                </div>
                <div class="report-date">${formatDate(report.date)}</div>
            </div>
            <div class="report-content">
                <div class="report-details">
                    <p><strong>Reported Content:</strong> ${report.content}</p>
                    <p><strong>Reporter:</strong> ${report.reporter}</p>
                    <p><strong>Category:</strong> ${formatCategory(report.category)}</p>
                    ${report.additionalInfo ? `<p><strong>Additional Info:</strong> ${report.additionalInfo}</p>` : ''}
                </div>
            </div>
            <div class="report-actions">
                <button class="btn btn-primary" onclick="reviewReport(${report.id})">
                    <i class="fas fa-search"></i> Review
                </button>
                <button class="btn btn-success" onclick="resolveReport(${report.id})">
                    <i class="fas fa-check"></i> Resolve
                </button>
                <button class="btn btn-secondary" onclick="dismissReport(${report.id})">
                    <i class="fas fa-times"></i> Dismiss
                </button>
            </div>
        </div>
    `).join('');
}

// Action Handlers
function togglePostVisibility(postId) {
    showActionModal({
        title: 'Toggle Post Visibility',
        message: 'Are you sure you want to change this post\'s visibility?',
        onConfirm: () => {
            // API call to toggle post visibility
            console.log(`Toggling visibility for post ${postId}`);
            loadPosts(); // Reload posts after action
        }
    });
}

function deletePost(postId) {
    showActionModal({
        title: 'Delete Post',
        message: 'Are you sure you want to delete this post? This action cannot be undone.',
        onConfirm: () => {
            // API call to delete post
            console.log(`Deleting post ${postId}`);
            loadPosts(); // Reload posts after action
        }
    });
}

function toggleUserStatus(userId) {
    showActionModal({
        title: 'Change User Status',
        message: 'Are you sure you want to change this user\'s status?',
        onConfirm: () => {
            // API call to toggle user status
            console.log(`Toggling status for user ${userId}`);
            loadUsers(); // Reload users after action
        }
    });
}

function banUser(userId) {
    showActionModal({
        title: 'Ban User',
        message: 'Are you sure you want to ban this user? This action cannot be undone.',
        onConfirm: () => {
            // API call to ban user
            console.log(`Banning user ${userId}`);
            loadUsers(); // Reload users after action
        }
    });
}

function resolveReport(reportId) {
    showActionModal({
        title: 'Resolve Report',
        message: 'Are you sure you want to mark this report as resolved?',
        onConfirm: () => {
            // API call to resolve report
            console.log(`Resolving report ${reportId}`);
            loadReports(); // Reload reports after action
        }
    });
}

function dismissReport(reportId) {
    showActionModal({
        title: 'Dismiss Report',
        message: 'Are you sure you want to dismiss this report?',
        onConfirm: () => {
            // API call to dismiss report
            console.log(`Dismissing report ${reportId}`);
            loadReports(); // Reload reports after action
        }
    });
}

// Utility Functions
function showActionModal({ title, message, onConfirm }) {
    const modal = document.getElementById('actionModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = `<p>${message}</p>`;
    
    modal.style.display = 'flex';
    
    modal.querySelector('[data-action="confirm"]').onclick = () => {
        onConfirm();
        modal.style.display = 'none';
    };
    
    modal.querySelector('[data-action="cancel"]').onclick = () => {
        modal.style.display = 'none';
    };
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function setupEventListeners() {
    // Search functionality
    document.querySelectorAll('.search-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
            filterItems(activeTab, searchTerm);
        });
    });

    // Status filter functionality
    document.querySelectorAll('.status-filter').forEach(select => {
        select.addEventListener('change', (e) => {
            const status = e.target.value;
            const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
            filterItems(activeTab, '', status);
        });
    });
}

function filterItems(tab, searchTerm = '', status = 'all') {
    const items = document.querySelectorAll(`#${tab}-tab .list-item`);
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const itemStatus = item.dataset.status;
        
        const matchesSearch = !searchTerm || text.includes(searchTerm);
        const matchesStatus = status === 'all' || itemStatus === status;
        
        item.style.display = matchesSearch && matchesStatus ? 'flex' : 'none';
    });
}

// Add new utility functions
function formatReportStatus(status) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatCategory(category) {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function reviewPost(postId) {
    // Implement post review functionality
    showActionModal({
        title: 'Review Post',
        message: `
            <div class="review-form">
                <h3>Post Review</h3>
                <div class="form-group">
                    <label>Review Notes:</label>
                    <textarea id="reviewNotes" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label>Action:</label>
                    <select id="reviewAction">
                        <option value="approve">Approve Post</option>
                        <option value="hide">Hide Post</option>
                        <option value="delete">Delete Post</option>
                        <option value="warn">Warn Author</option>
                    </select>
                </div>
            </div>
        `,
        onConfirm: () => {
            const notes = document.getElementById('reviewNotes').value;
            const action = document.getElementById('reviewAction').value;
            // Implement the API call to handle the review
            console.log(`Reviewing post ${postId} with action: ${action} and notes: ${notes}`);
            loadPosts();
        }
    });
}

function reviewReport(reportId) {
    // Simulate fetching report data
    const report = {
        id: reportId,
        type: "Post",
        contentId: 123,
        content: "This is the reported content that needs review...",
        reporter: "User123",
        date: "2024-01-15",
        status: "pending",
        category: "harmful_content",
        urgency: "high",
        originalPost: {
            id: 123,
            author: "JohnDoe",
            content: "Original post content here...",
            date: "2024-01-14",
            likes: 5,
            comments: 3,
            reportCount: 3,
            previousReports: [
                {
                    date: "2024-01-13",
                    reason: "Inappropriate content",
                    status: "resolved"
                }
            ]
        }
    };

    showActionModal({
        title: 'Review Report',
        message: `
            <div class="review-form">
                <div class="reported-content-section">
                    <div class="reported-content-header">
                        <h3>Reported Content</h3>
                        <span class="report-urgency urgency-${report.urgency}">${report.urgency.toUpperCase()}</span>
                    </div>
                    <div class="post-preview">
                        <div class="post-preview-header">
                            <div class="author-info">
                                <i class="fas fa-user"></i>
                                <span class="preview-author">${report.originalPost.author}</span>
                            </div>
                            <span class="preview-date">${formatDate(report.originalPost.date)}</span>
                        </div>
                        <div class="post-preview-content">
                            ${report.originalPost.content}
                        </div>
                        <div class="post-preview-stats">
                            <span><i class="fas fa-heart"></i> ${report.originalPost.likes}</span>
                            <span><i class="fas fa-comment"></i> ${report.originalPost.comments}</span>
                            <span><i class="fas fa-flag"></i> ${report.originalPost.reportCount} reports</span>
                        </div>
                    </div>
                </div>

                <div class="report-metadata">
                    <h4>Report Details</h4>
                    <ul>
                        <li>
                            <span class="report-metadata-label">Reported By:</span>
                            <span>${report.reporter}</span>
                        </li>
                        <li>
                            <span class="report-metadata-label">Category:</span>
                            <span>${formatCategory(report.category)}</span>
                        </li>
                        <li>
                            <span class="report-metadata-label">Date Reported:</span>
                            <span>${formatDate(report.date)}</span>
                        </li>
                        <li>
                            <span class="report-metadata-label">Previous Reports:</span>
                            <span>${report.originalPost.previousReports.length}</span>
                        </li>
                    </ul>
                </div>

                <div class="form-group">
                    <label>Review Notes:</label>
                    <textarea id="reviewNotes" rows="4" placeholder="Add your review notes here..."></textarea>
                </div>

                <div class="form-group">
                    <label>Take Action:</label>
                    <select id="reviewAction">
                        <option value="">Select an action...</option>
                        <option value="approve">Approve Content</option>
                        <option value="hide">Hide Content</option>
                        <option value="warn">Warn User</option>
                        <option value="delete">Delete Content</option>
                        <option value="ban">Ban User</option>
                        <option value="dismiss">Dismiss Report</option>
                    </select>
                </div>
            </div>
        `,
        onConfirm: () => {
            const notes = document.getElementById('reviewNotes').value;
            const action = document.getElementById('reviewAction').value;
            
            if (!action) {
                alert('Please select an action');
                return;
            }
            
            // Implement the API call to handle the review
            console.log(`Reviewing report ${reportId}`, { action, notes });
            loadReports();
        }
    });
}
