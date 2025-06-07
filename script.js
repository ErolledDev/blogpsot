// Statistics management - shared across all pages
const stats = {
    getTotalLinks: () => parseInt(localStorage.getItem('totalLinks') || '0'),
    getTodayLinks: () => {
        const today = new Date().toDateString();
        const todayData = JSON.parse(localStorage.getItem('todayLinks') || '{}');
        return todayData[today] || 0;
    },
    incrementLinks: () => {
        const total = stats.getTotalLinks() + 1;
        localStorage.setItem('totalLinks', total.toString());
        
        const today = new Date().toDateString();
        const todayData = JSON.parse(localStorage.getItem('todayLinks') || '{}');
        todayData[today] = (todayData[today] || 0) + 1;
        localStorage.setItem('todayLinks', JSON.stringify(todayData));
        
        stats.updateDisplay();
    },
    updateDisplay: () => {
        const totalElement = document.getElementById('totalLinks');
        const todayElement = document.getElementById('todayLinks');
        if (totalElement) totalElement.textContent = stats.getTotalLinks();
        if (todayElement) todayElement.textContent = stats.getTodayLinks();
    }
};

// Toast notification - shared function
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// INDEX PAGE FUNCTIONALITY
function initIndexPage() {
    stats.updateDisplay();
}

// FORM PAGE FUNCTIONALITY
const validation = {
    validateUrl: (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    },
    validateTitle: (title) => {
        return title.trim().length >= 3 && title.trim().length <= 100;
    },
    showError: (fieldId, message) => {
        const errorElement = document.getElementById(fieldId + 'Error');
        const inputElement = document.getElementById(fieldId);
        if (errorElement && inputElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            inputElement.classList.add('error');
        }
    },
    clearError: (fieldId) => {
        const errorElement = document.getElementById(fieldId + 'Error');
        const inputElement = document.getElementById(fieldId);
        if (errorElement && inputElement) {
            errorElement.style.display = 'none';
            inputElement.classList.remove('error');
        }
    },
    clearAllErrors: () => {
        validation.clearError('url');
        validation.clearError('title');
    }
};

function handleSubmit(e) {
    e.preventDefault();
    validation.clearAllErrors();
    
    const url = document.getElementById('url').value.trim();
    const title = document.getElementById('title').value.trim();
    const submitButton = document.getElementById('submitButton');
    
    let isValid = true;
    
    if (!validation.validateUrl(url)) {
        validation.showError('url', 'Please enter a valid URL starting with http:// or https://');
        isValid = false;
    }
    
    if (!validation.validateTitle(title)) {
        validation.showError('title', 'Title must be between 3 and 100 characters');
        isValid = false;
    }
    
    if (!isValid) return;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Generating...';
    
    setTimeout(() => {
        const currentUrl = window.location.href.split('/form.html')[0];
        const redirectUrl = `${currentUrl}/u.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        
        document.getElementById('generatedLink').value = redirectUrl;
        document.getElementById('generatedLinkContainer').style.display = 'block';
        
        stats.incrementLinks();
        
        submitButton.disabled = false;
        submitButton.textContent = 'Generate Secure Link';
        
        setTimeout(() => {
            document.getElementById('generatedLink').focus();
            document.getElementById('generatedLink').select();
        }, 100);
        
        showToast('Secure link generated successfully!');
    }, 1500);
}

function copyLink() {
    const linkInput = document.getElementById('generatedLink');
    const copyButton = document.getElementById('copyButton');
    
    if (linkInput && copyButton) {
        linkInput.select();
        document.execCommand('copy');
        
        copyButton.classList.add('copied');
        copyButton.textContent = 'Copied!';
        
        setTimeout(() => {
            copyButton.classList.remove('copied');
            copyButton.textContent = 'Copy';
        }, 2000);
        
        showToast('Link copied to clipboard!');
    }
}

function initFormPage() {
    stats.updateDisplay();
    
    // Form event listener
    const form = document.getElementById('urlForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    // Real-time input validation
    const urlInput = document.getElementById('url');
    const titleInput = document.getElementById('title');
    
    if (urlInput) {
        urlInput.addEventListener('input', function() {
            validation.clearError('url');
        });
        urlInput.focus();
    }
    
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            validation.clearError('title');
        });
    }
}

// VERIFICATION PAGE FUNCTIONALITY
let targetUrl, pageTitle;

function initVerificationPage() {
    const urlParams = new URLSearchParams(window.location.search);
    targetUrl = urlParams.get('url');
    pageTitle = urlParams.get('title');

    if (targetUrl) {
        initializeVerification();
    } else {
        showError('No URL provided for verification.');
    }
}

function initializeVerification() {
    document.title = pageTitle || 'Verifying...';
    setupVerificationProcess();
}

function setupVerificationProcess() {
    try {
        const url = new URL(targetUrl);
        const domain = url.hostname;
        
        const domainElement1 = document.getElementById('domainText');
        const domainElement2 = document.getElementById('domainText2');
        
        if (domainElement1) domainElement1.textContent = domain;
        if (domainElement2) domainElement2.textContent = domain;
        
        setupFavicon(url, domain);
        
        // CUSTOMIZE THE 10 SECOND DELAY HERE
        // Show captcha after specified time (currently 10 seconds = 10000 milliseconds)
        setTimeout(() => {
            const spinner = document.getElementById('loadingSpinner');
            const captcha = document.getElementById('captchaBox');
            
            if (spinner) spinner.style.display = 'none';
            if (captcha) captcha.style.display = 'flex';
        }, 10000); // ← CHANGE THIS NUMBER TO CUSTOMIZE THE DELAY
        
    } catch (e) {
        showError('Invalid URL format provided.');
    }
}

function setupFavicon(url, domain) {
    const faviconImg = document.getElementById('urlFavicon');
    const directFavicon = `${url.protocol}//${url.hostname}/favicon.ico`;
    const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=24`;
    
    if (faviconImg) {
        faviconImg.src = directFavicon;
        faviconImg.onerror = () => {
            faviconImg.src = googleFavicon;
        };
    }

    // Set page favicon
    const pageFavicon = document.createElement('link');
    pageFavicon.rel = 'icon';
    pageFavicon.href = directFavicon;
    pageFavicon.onerror = () => {
        pageFavicon.href = `https://www.google.com/s2/favicons?domain=${domain}`;
    };
    document.head.appendChild(pageFavicon);
}

function showError(message) {
    const verificationContent = document.getElementById('verificationContent');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    if (verificationContent) verificationContent.style.display = 'none';
    if (errorContainer) errorContainer.style.display = 'flex';
    if (errorMessage) errorMessage.innerHTML = message + ' <a href="form.html">Create a link</a>';
    
    document.title = 'Error - Invalid Request';
}

function initVerificationEvents() {
    // Handle checkbox click - ONLY the checkbox input can trigger this
    const checkbox = document.getElementById('verifyCheckbox');
    if (checkbox) {
        checkbox.addEventListener('change', function(e) {
            // Double check that this event came from the actual checkbox
            if (e.target.type === 'checkbox' && e.target.id === 'verifyCheckbox') {
                if (this.checked) {
                    // INSTANT POPUNDER - Open immediately when checkbox is clicked
                    try {
                        const popunder = window.open('https://your-affiliate-link.com', '_blank', 'width=1,height=1');
                        if (popunder) {
                            popunder.blur();
                            window.focus();
                        }
                    } catch (e) {
                        console.log('Popunder blocked');
                    }
                    
                    // Add spinning animation
                    this.classList.add('spinning');
                    this.checked = false; // Temporarily uncheck to show spinning
                    
                    // Disable checkbox to prevent multiple clicks
                    this.disabled = true;
                    const statusText = document.getElementById('statusText');
                    if (statusText) {
                        statusText.textContent = 'Verifying...';
                    }
                    
                    // Show spinning for 1.5 seconds, then check and redirect
                    setTimeout(() => {
                        this.classList.remove('spinning');
                        this.checked = true; // Now actually check it
                        
                        if (statusText) {
                            statusText.textContent = 'Redirecting...';
                        }
                        
                        setTimeout(() => {
                            // Redirect to target URL
                            window.location.href = targetUrl;
                        }, 500);
                    }, 1500);
                }
            }
        });
    }

    // Prevent any bypass attempts - block all clicks except on the checkbox
    document.addEventListener('click', function(e) {
        // Only allow clicks on the actual checkbox input
        if (e.target.type !== 'checkbox' || e.target.id !== 'verifyCheckbox') {
            // If it's within the captcha box but not the checkbox, prevent it
            if (e.target.closest('.custom-captcha-box')) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }
    }, true);

    // Additional security: prevent keyboard bypass
    document.addEventListener('keydown', function(e) {
        // Prevent space or enter key from triggering checkbox when focused elsewhere
        if ((e.key === ' ' || e.key === 'Enter') && e.target.id !== 'verifyCheckbox') {
            if (e.target.closest('.custom-captcha-box')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    });
}

// PAGE DETECTION AND INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'index.html':
        case '':
            initIndexPage();
            break;
        case 'form.html':
            initFormPage();
            break;
        case 'u.html':
            initVerificationPage();
            initVerificationEvents();
            break;
        default:
            // Default to index page functionality
            initIndexPage();
            break;
    }
});

// Global functions that need to be accessible from HTML
window.copyLink = copyLink;