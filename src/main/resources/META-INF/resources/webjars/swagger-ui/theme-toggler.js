(function () {
    'use strict';

    let currentThemeStylesheet = null;

    const themes = {
        auto: {name: 'Auto', emoji: '🌓', category: 'system'},
        classic: {name: 'Classic', emoji: '🏛️', category: 'light'},
        dark: {name: 'Dark', emoji: '🌙', category: 'dark'},
        'dark-monokai': {name: 'Dark Monokai', emoji: '🌚', category: 'dark'},
        dracula: {name: 'Dracula', emoji: '🧛', category: 'dark'},
        'feeling-blue': {name: 'Feeling Blue', emoji: '💙', category: 'colored'},
        flattop: {name: 'Flattop', emoji: '📱', category: 'modern'},
        gruvbox: {name: 'Gruvbox', emoji: '🏔️', category: 'dark'},
        material: {name: 'Material', emoji: '🎨', category: 'modern'},
        monokai: {name: 'Monokai', emoji: '👨‍💻', category: 'dark'},
        muted: {name: 'Muted', emoji: '🔇', category: 'subtle'},
        newspaper: {name: 'Newspaper', emoji: '📰', category: 'classic'},
        'nord-dark': {name: 'Nord Dark', emoji: '🏔️', category: 'dark'},
        'one-dark': {name: 'One Dark', emoji: '⚡', category: 'dark'},
        outline: {name: 'Outline', emoji: '📝', category: 'minimal'}
    };

    function loadTheme(themeName) {
        console.log('Loading theme:', themeName);
        removeCurrentTheme();
        if (themeName === 'classic') {
            console.log('Classic theme loaded (default styling)');
            return;
        }

        currentThemeStylesheet = document.createElement('link');
        currentThemeStylesheet.rel = 'stylesheet';
        currentThemeStylesheet.type = 'text/css';
        currentThemeStylesheet.href = `./themes/${themeName}.css`;
        currentThemeStylesheet.id = `theme-${themeName}-stylesheet`;

        currentThemeStylesheet.onload = function () {
            console.log(`${themes[themeName]?.name || themeName} theme loaded successfully`);
        };

        currentThemeStylesheet.onerror = function () {
            console.error(`Failed to load ${themes[themeName]?.name || themeName} theme`);
        };

        document.head.appendChild(currentThemeStylesheet);
    }

    function removeCurrentTheme() {
        if (currentThemeStylesheet && currentThemeStylesheet.parentNode) {
            document.head.removeChild(currentThemeStylesheet);
            currentThemeStylesheet = null;
            console.log('Current theme removed');
        }
    }

    function updateThemeSelector(theme) {
        const themeSelector = document.querySelector('.theme-selector');
        if (themeSelector) {
            themeSelector.className = `theme-selector ${theme}`;
            themeSelector.setAttribute('data-current-theme', theme);
            themeSelector.setAttribute('data-theme-category', themes[theme]?.category || 'unknown');
        }
    }

    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'classic';
    }

    function toggleTheme(theme) {
        console.log('Switching to theme:', theme);

        let actualTheme = theme;
        if (theme === 'auto') {
            actualTheme = getSystemTheme();
        }

        loadTheme(actualTheme);
        updateThemeSelector(actualTheme);
        localStorage.setItem('swagger-theme', theme); // Save the selection

        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);

        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: theme,
                actualTheme: actualTheme,
                themeInfo: themes[actualTheme]
            }
        });
        window.dispatchEvent(event);
    }

    function getInitialTheme() {
        const savedTheme = localStorage.getItem('swagger-theme');

        if (savedTheme && themes[savedTheme]) {
            console.log('Using saved theme:', savedTheme);
            return savedTheme;
        }

        console.log('Using auto theme (system default)');
        return 'auto';
    }

    function initializeTheme() {
        const initialTheme = getInitialTheme();
        const themeSelector = document.querySelector('.theme-selector');

        if (themeSelector) {
            themeSelector.value = initialTheme;
            toggleTheme(initialTheme);
        }

        console.log('Theme initialized:', initialTheme);
    }

    function setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            mediaQuery.addEventListener('change', function (e) {
                const savedTheme = localStorage.getItem('swagger-theme');
                if (savedTheme === 'auto' || !savedTheme) {
                    const newTheme = e.matches ? 'dark' : 'classic';
                    const themeSelector = document.querySelector('.theme-selector');

                    if (themeSelector && savedTheme === 'auto') {
                        toggleTheme('auto');
                    }

                    console.log('System theme changed, auto theme now using:', newTheme);
                }
            });
        }
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                cycleTheme();
            }

            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                cycleDarkThemes();
            }
        });
    }

    function cycleTheme() {
        const themeSelector = document.querySelector('.theme-selector');
        if (!themeSelector) return;

        const currentValue = themeSelector.value;
        const themeKeys = Object.keys(themes);
        const currentIndex = themeKeys.indexOf(currentValue);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        const nextTheme = themeKeys[nextIndex];

        themeSelector.value = nextTheme;
        toggleTheme(nextTheme);
    }

    function cycleDarkThemes() {
        const themeSelector = document.querySelector('.theme-selector');
        if (!themeSelector) return;

        const darkThemes = Object.keys(themes).filter(key =>
            themes[key].category === 'dark' || key === 'dark'
        );

        const currentValue = themeSelector.value;
        const currentIndex = darkThemes.indexOf(currentValue);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % darkThemes.length;
        const nextTheme = darkThemes[nextIndex];

        themeSelector.value = nextTheme;
        toggleTheme(nextTheme);
    }

    function getThemesByCategory(category) {
        return Object.keys(themes).filter(key => themes[key].category === category);
    }

    function randomTheme() {
        const themeKeys = Object.keys(themes).filter(key => key !== 'auto');
        const randomIndex = Math.floor(Math.random() * themeKeys.length);
        const randomTheme = themeKeys[randomIndex];

        const themeSelector = document.querySelector('.theme-selector');
        if (themeSelector) {
            themeSelector.value = randomTheme;
            toggleTheme(randomTheme);
        }
    }

    window.toggleTheme = toggleTheme;
    window.cycleTheme = cycleTheme;
    window.cycleDarkThemes = cycleDarkThemes;
    window.randomTheme = randomTheme;
    window.getAvailableThemes = () => themes;
    window.getThemesByCategory = getThemesByCategory;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initializeTheme();
            setupSystemThemeListener();
            setupKeyboardShortcuts();
        });
    } else {
        initializeTheme();
        setupSystemThemeListener();
        setupKeyboardShortcuts();
    }

    function previewTheme(themeName, duration = 2000) {
        const originalTheme = localStorage.getItem('swagger-theme') || 'auto';
        toggleTheme(themeName);

        setTimeout(() => {
            toggleTheme(originalTheme);
        }, duration);
    }

    window.previewTheme = previewTheme;

    console.log('🎨 Swagger UI Ultimate Theme Library loaded!');
    console.log('Available themes:', Object.keys(themes).length);
    console.log('Theme categories:', [...new Set(Object.values(themes).map(t => t.category))]);
    console.log('Keyboard shortcuts:');
    console.log('  - Ctrl/Cmd + Shift + T: Cycle all themes');
    console.log('  - Ctrl/Cmd + Shift + D: Cycle dark themes only');
    console.log('Functions available:');
    console.log('  - randomTheme(): Apply random theme');
    console.log('  - getThemesByCategory("dark"): Get themes by category');
})();
