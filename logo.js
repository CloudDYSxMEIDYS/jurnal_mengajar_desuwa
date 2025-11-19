/**
 * ============================================================================
 * LOGO CUSTOMIZATION SYSTEM — PABRIK LOGO MINI
 * ============================================================================
 * A tiny, slightly eccentric factory for logos. Pick an emoji, fling some
 * colors at it, and save the result in localStorage. No designers were harmed
 * in the making of these gradients.
 * ============================================================================
 */

// LocalStorage key for storing the current logo configuration
const LOGO_STORAGE_KEY = 'appLogo';

/**
 * Predefined logo templates with default settings
 * Each template provides: name, emoji, color gradient, background class, description
 */
const LOGO_TEMPLATES = {
    modern: {
        name: 'Modern',
        emoji: '',
        colors: ['from-purple-400', 'to-pink-400'],
        bgClass: 'bg-gradient-to-br',
        description: 'Modern gradient logo with book emoji'
    },
    academic: {
        name: 'Academic',
        emoji: '',
        colors: ['from-blue-500', 'to-blue-700'],
        bgClass: 'bg-gradient-to-br',
        description: 'Academic style with graduation cap'
    },
    creative: {
        name: 'Creative',
        emoji: '',
        colors: ['from-yellow-400', 'to-orange-500'],
        bgClass: 'bg-gradient-to-br',
        description: 'Creative design with sparkle'
    },
    professional: {
        name: 'Professional',
        emoji: '',
        colors: ['from-gray-700', 'to-gray-900'],
        bgClass: 'bg-gradient-to-br',
        description: 'Professional journal style'
    },
    vibrant: {
        name: 'Vibrant',
        emoji: '',
        colors: ['from-red-500', 'to-yellow-500'],
        bgClass: 'bg-gradient-to-br',
        description: 'Vibrant and energetic design'
    }
};

/**
 * LogoCustomizer Class
 * Manages all logo configuration and customization
 */
class LogoCustomizer {
    constructor() {
        // Load saved logo from localStorage, or use modern template as default
        this.currentLogo = this.loadLogo();
    }

    /**
     * Load logo configuration from localStorage
     * @returns {Object} - Logo configuration object
     */
    loadLogo() {
        const saved = localStorage.getItem(LOGO_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {
            template: 'modern',
            emoji: LOGO_TEMPLATES.modern.emoji,
            colors: LOGO_TEMPLATES.modern.colors,
            customText: '',
            size: 'base'
        };
    }

    /**
     * Save logo configuration to localStorage
     * @param {Object} logo - Logo configuration to save
     */
    saveLogo(logo) {
        this.currentLogo = logo;
        localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(logo));
    }

    /**
     * Set the logo template (changes emoji and default colors)
     * @param {string} templateName - Name of template to use
     * @returns {boolean} - True if template was valid and applied
     */
    setTemplate(templateName) {
        if (LOGO_TEMPLATES[templateName]) {
            const template = LOGO_TEMPLATES[templateName];
            this.currentLogo = {
                template: templateName,
                emoji: template.emoji,
                colors: template.colors,
                customText: this.currentLogo.customText || '',
                size: this.currentLogo.size || 'base'
            };
            this.saveLogo(this.currentLogo);
            return true;
        }
        return false;
    }

    /**
     * Change the emoji displayed in the logo
     * @param {string} emoji - Unicode emoji character
     */
    setEmoji(emoji) {
        this.currentLogo.emoji = emoji;
        this.saveLogo(this.currentLogo);
    }

    /**
     * Change the gradient colors of the logo
     * @param {string} colorFrom - Tailwind color class for gradient start
     * @param {string} colorTo - Tailwind color class for gradient end
     */
    setColors(colorFrom, colorTo) {
        this.currentLogo.colors = [colorFrom, colorTo];
        this.saveLogo(this.currentLogo);
    }

    /**
     * Set custom text to display (optional)
     * @param {string} text - Custom text
     */
    setCustomText(text) {
        this.currentLogo.customText = text;
        this.saveLogo(this.currentLogo);
    }

    /**
     * Change the size of the logo
     * @param {string} size - Size: 'sm', 'base', 'lg', 'xl'
     */
    setSize(size) {
        this.currentLogo.size = size;
        this.saveLogo(this.currentLogo);
    }

    /**
     * Generate HTML markup for the current logo
     * @returns {string} - HTML string for the logo
     */
    getHTML() {
        // Map size names to Tailwind width/height classes
        const sizeClasses = {
            'sm': 'w-12 h-12',
            'base': 'w-16 h-16',
            'lg': 'w-20 h-20',
            'xl': 'w-24 h-24'
        };

        const sizeClass = sizeClasses[this.currentLogo.size] || sizeClasses['base'];
        const [colorFrom, colorTo] = this.currentLogo.colors;

        return `
            <div class="inline-flex items-center justify-center ${sizeClass} ${LOGO_TEMPLATES[this.currentLogo.template].bgClass} ${colorFrom} ${colorTo} rounded-full shadow-lg">
                <span class="text-2xl">${this.currentLogo.emoji}</span>
            </div>
        `;
    }

    /**
     * Get the current logo configuration
     * @returns {Object} - Current logo settings
     */
    getLogoConfig() {
        return this.currentLogo;
    }

    /**
     * Get all available logo templates
     * @returns {Object} - All template definitions
     */
    getAllTemplates() {
        return LOGO_TEMPLATES;
    }
}

// Create global instance of LogoCustomizer
const logoCustomizer = new LogoCustomizer();

/**
 * Helper function to render logo in a specific DOM element
 * @param {string} containerId - ID of the DOM element to render logo into
 */
function renderLogo(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = logoCustomizer.getHTML();
    }
}

/**
 * Export functions to global scope for use in HTML and other scripts
 */
window.logoCustomizer = logoCustomizer;
window.renderLogo = renderLogo;
