// Statistics management
const stats = {
    getTotalLinks: () => parseInt(localStorage.getItem('totalLinks') || '0'),
    getTodayLinks: () => {
        const today = new Date().toDateString();
        const todayData = JSON.parse(localStorage.getItem('todayLinks') || '{}');
        return todayData[today] || 0;
    },
    updateDisplay: () => {
        document.getElementById('totalLinks').textContent = stats.getTotalLinks();
        document.getElementById('todayLinks').textContent = stats.getTodayLinks();
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    stats.updateDisplay();
});