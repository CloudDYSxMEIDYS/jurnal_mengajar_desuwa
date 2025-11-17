// Logo Customization System

const LOGO_STORAGE_KEY = 'appLogo';

const LOGO_TEMPLATES = {
    modern: {
        name: 'Modern',
        emoji: '📚',
        colors: ['from-purple-400', 'to-pink-400'],
        bgClass: 'bg-gradient-to-br',
        description: 'Modern gradient logo with book emoji'
    },
    academic: {
        name: 'Academic',
        emoji: '🎓',
        colors: ['from-blue-500', 'to-blue-700'],
        bgClass: 'bg-gradient-to-br',
        description: 'Academic style with graduation cap'
    },
    creative: {
        name: 'Creative',
        emoji: '✨',
        colors: ['from-yellow-400', 'to-orange-500'],
        bgClass: 'bg-gradient-to-br',
        description: 'Creative design with sparkle'
    },
    professional: {
        name: 'Professional',
        emoji: '📖',
        colors: ['from-gray-700', 'to-gray-900'],
        bgClass: 'bg-gradient-to-br',
        description: 'Professional journal style'
    },
    vibrant: {
        name: 'Vibrant',
        emoji: '🌟',
        colors: ['from-red-500', 'to-yellow-500'],
        bgClass: 'bg-gradient-to-br',
        description: 'Vibrant and energetic design'
    }
};

class LogoCustomizer {
    constructor() {
        this.currentLogo = this.loadLogo();
    }

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

    saveLogo(logo) {
        this.currentLogo = logo;
        localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(logo));
    }

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

    setEmoji(emoji) {
        this.currentLogo.emoji = emoji;
        this.saveLogo(this.currentLogo);
    }

    setColors(colorFrom, colorTo) {
        this.currentLogo.colors = [colorFrom, colorTo];
        this.saveLogo(this.currentLogo);
    }

    setCustomText(text) {
        this.currentLogo.customText = text;
        this.saveLogo(this.currentLogo);
    }

    setSize(size) {
        this.currentLogo.size = size;
        this.saveLogo(this.currentLogo);
    }

    getHTML() {
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

    getLogoConfig() {
        return this.currentLogo;
    }

    getAllTemplates() {
        return LOGO_TEMPLATES;
    }
}

// Create global instance
const logoCustomizer = new LogoCustomizer();

// Helper function to render logo in DOM
function renderLogo(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = logoCustomizer.getHTML();
    }
}

// Expose globally
window.logoCustomizer = logoCustomizer;
window.renderLogo = renderLogo;
