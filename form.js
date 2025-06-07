// Statistics management
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
        document.getElementById('totalLinks').textContent = stats.getTotalLinks();
        document.getElementById('todayLinks').textContent = stats.getTodayLinks();
    }
};

// Form validation
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
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('error');
    },
    clearError: (fieldId) => {
        const errorElement = document.getElementById(fieldId + 'Error');
        const inputElement = document.getElementById(fieldId);
        errorElement.style.display = 'none';
        inputElement.classList.remove('error');
    },
    clearAllErrors: () => {
        validation.clearError('url');
        validation.clearError('title');
    }
};

// Toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Form submission handler
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

// Copy link functionality
function copyLink() {
    const linkInput = document.getElementById('generatedLink');
    const copyButton = document.getElementById('copyButton');
    
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    stats.updateDisplay();
    
    // Form event listener
    document.getElementById('urlForm').addEventListener('submit', handleSubmit);
    
    // Real-time input validation
    document.getElementById('url').addEventListener('input', function() {
        validation.clearError('url');
    });
    
    document.getElementById('title').addEventListener('input', function() {
        validation.clearError('title');
    });
    
    // Focus on first input
    document.getElementById('url').focus();
});