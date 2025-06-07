// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get('url');
const pageTitle = urlParams.get('title');

// Initialize based on URL parameters
if (targetUrl) {
    initializeVerification();
} else {
    showError('No URL provided for verification.');
}

function initializeVerification() {
    document.title = pageTitle || 'Verifying...';
    setupVerificationProcess();
}

function setupVerificationProcess() {
    try {
        const url = new URL(targetUrl);
        const domain = url.hostname;
        
        document.getElementById('domainText').textContent = domain;
        document.getElementById('domainText2').textContent = domain;
        
        setupFavicon(url, domain);
        
        // Show captcha after 10 seconds
        setTimeout(() => {
            document.getElementById('loadingSpinner').style.display = 'none';
            document.getElementById('captchaBox').style.display = 'flex';
        }, 10000);
        
    } catch (e) {
        showError('Invalid URL format provided.');
    }
}

function setupFavicon(url, domain) {
    const faviconImg = document.getElementById('urlFavicon');
    const directFavicon = `${url.protocol}//${url.hostname}/favicon.ico`;
    const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    
    faviconImg.src = directFavicon;
    faviconImg.onerror = () => {
        faviconImg.src = googleFavicon;
    };

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
    document.getElementById('verificationContent').style.display = 'none';
    document.getElementById('errorContainer').style.display = 'flex';
    document.getElementById('errorMessage').innerHTML = message + ' <a href="form.html">Create a link</a>';
    document.title = 'Error - Invalid Request';
}

// Handle checkbox click - ONLY the checkbox input can trigger this
document.getElementById('verifyCheckbox').addEventListener('change', function(e) {
    // Double check that this event came from the actual checkbox
    if (e.target.type === 'checkbox' && e.target.id === 'verifyCheckbox') {
        if (this.checked) {
            // Disable checkbox to prevent multiple clicks
            this.disabled = true;
            document.getElementById('statusText').textContent = 'Verification successful! Redirecting...';
            
            setTimeout(() => {
                // Open popunder (replace with your affiliate link)
                try {
                    const popunder = window.open('https://your-affiliate-link.com', '_blank', 'width=1,height=1');
                    if (popunder) {
                        popunder.blur();
                        window.focus();
                    }
                } catch (e) {
                    console.log('Popunder blocked');
                }
                
                // Redirect to target URL
                window.location.href = targetUrl;
            }, 2000);
        }
    }
});

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