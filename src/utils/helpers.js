// Utility helper functions
export const helpers = {
  // Format timestamp
  formatTimestamp(date = new Date()) {
    return date.toISOString();
  },

  // Generate unique ID
  generateId() {
    return Date.now().toString();
  },

  // Validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Sanitize input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  },

  // Calculate composite score
  calculateCompositeScore(scores) {
    const weights = {
      researchGap: 0.12,
      futurePotential: 0.16,
      competitors: 0.10,
      teamStrength: 0.16,
      techNovelty: 0.16,
      marketDemand: 0.12,
      marketPotential: 0.10,
      revenue: 0.08,
    };

    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(scores).forEach(([key, value]) => {
      if (weights[key]) {
        // Invert competition score (lower competition = higher score)
        const adjustedValue = key === 'competitors' ? 11 - value : value;
        weightedSum += adjustedValue * weights[key];
        totalWeight += weights[key];
      }
    });

    return totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};


