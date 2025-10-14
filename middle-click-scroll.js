// ==UserScript==
// @name         Middle Click Scroll (Hold to Scroll)
// @namespace    http://tampermonkey.net/
// @version      8
// @description  Hold down the middle mouse button to scroll. Independently targets horizontal and vertical scroll elements under the cursor. Ignores clicks on links.
// @author       quoc.v.anh@gmail.com
// @match        *://*/*
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    /** @type {boolean} - Flag to indicate if scroll mode is active */
    let isScrollModeActive = false;

    /** @type {number} - Initial X/Y-coordinates of the mouse when the mode is activated */
    let startX = 0;
    let startY = 0;

    /** @type {number} - The current amount to scroll continuously on each axis */
    let scrollAmountX = 0;
    let scrollAmountY = 0;

    /** @type {number | null} - ID for storing requestAnimationFrame */
    let animationFrameId = null;

    /** @type {HTMLElement | Window | null} - The elements to be scrolled for each axis. */
    let scrollTargetX = null;
    let scrollTargetY = null;

    /** @type {number} - Sensitivity/speed factor, adjust this value to change the scrolling speed */
    const SENSITIVITY_FACTOR = 0.5;

    // --- Create and inject the styles for the visual indicator ---
    GM_addStyle(`
        #mmb-scroll-indicator {
            position: fixed;
            width: 32px;
            height: 32px;
            background-color: rgba(255, 255, 255, 0.125);
            border: 2px solid white;
            border-radius: 50%;
            z-index: 99999999;
            pointer-events: none; /* Allow mouse events to pass through this element */
            display: none; /* Hidden by default */
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="white" width="32" height="32"><circle cx="16" cy="16" r="3"/><path d="M16 4 L12 8 L20 8 Z M16 28 L12 24 L20 24 Z M4 16 L8 12 L8 20 Z M28 16 L24 12 L24 20 Z"/></svg>');
            background-size: 80%;
            background-repeat: no-repeat;
            background-position: center;
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
        }
    `);

    // --- Create the visual indicator element ---
    const indicator = document.createElement('div');
    indicator.id = 'mmb-scroll-indicator';
    document.body.appendChild(indicator);

    /**
     * The core function for continuous scrolling
     */
    const performScroll = () => {
        if (!isScrollModeActive) {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            return;
        }

        if (scrollAmountX !== 0 && scrollTargetX) {
            scrollTargetX.scrollBy(scrollAmountX, 0);
        }
        if (scrollAmountY !== 0 && scrollTargetY) {
            scrollTargetY.scrollBy(0, scrollAmountY);
        }

        animationFrameId = requestAnimationFrame(performScroll);
    };

    // --- Function to activate scroll mode ---
    const activateScrollMode = (e) => {
        // Search for the vertical scroll target
        let currentElementY = e.target;
        while (currentElementY && currentElementY !== document.body) {
            if (currentElementY.scrollHeight > currentElementY.clientHeight) {
                scrollTargetY = currentElementY;
                break;
            }
            currentElementY = currentElementY.parentElement;
        }

        // Search for the horizontal scroll target
        let currentElementX = e.target;
        while (currentElementX && currentElementX !== document.body) {
            if (currentElementX.scrollWidth > currentElementX.clientWidth) {
                scrollTargetX = currentElementX;
                break;
            }
            currentElementX = currentElementX.parentElement;
        }

        // Fallback to the window if no specific element was found for each axis
        if (!scrollTargetY) {
            scrollTargetY = window;
        }
        if (!scrollTargetX) {
            scrollTargetX = window;
        }

        isScrollModeActive = true;
        startX = e.clientX;
        startY = e.clientY;
        document.body.style.cursor = 'all-scroll';

        indicator.style.left = `${e.clientX - 16}px`;
        indicator.style.top = `${e.clientY - 16}px`;
        indicator.style.display = 'block';

        performScroll();
    };

    // --- Encapsulated logic for deactivating scroll mode for reusability ---
    const deactivateScrollMode = () => {
        isScrollModeActive = false;
        document.body.style.cursor = 'default';
        indicator.style.display = 'none';
        scrollAmountX = 0;
        scrollAmountY = 0;
        scrollTargetX = null;
        scrollTargetY = null;
    };

    /**
     * Mouse down event handler, used to activate the mode
     */
    const handleMouseDown = (e) => {
        if (e.button === 1) {
            if (e.target.closest('a[href]')) {
                return;
            }
            e.preventDefault();
            if (!isScrollModeActive) {
                activateScrollMode(e);
            }
        }
    };

    /**
     * Mouse up event handler, used to deactivate the mode
     */
    const handleMouseUp = (e) => {
        if (e.button === 1 && isScrollModeActive) {
            e.preventDefault();
            deactivateScrollMode();
        }
    };


    /**
     * Mouse move event handler, used only to update scroll speed and direction
     */
    const handleMouseMove = (e) => {
        if (!isScrollModeActive) return;

        const currentX = e.clientX;
        const currentY = e.clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        scrollAmountX = deltaX * SENSITIVITY_FACTOR;
        scrollAmountY = deltaY * SENSITIVITY_FACTOR;
    };

    // Bind event listeners
    window.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('mousemove', handleMouseMove, false);
    window.addEventListener('contextmenu', (e) => {
        if (isScrollModeActive) {
            e.preventDefault();
        }
    }, true);

})();
