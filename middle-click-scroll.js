// ==UserScript==
// @name         Middle Click Scroll (Hold to Scroll)
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Hold down the middle mouse button to scroll the element under the cursor. The page continuously scrolls based on the mouse's distance and direction from the initial point.
// @author       quoc.v.anh@gmail.com
// @match        *://*/*
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    /** @type {boolean} - Flag to indicate if scroll mode is active */
    let isScrollModeActive = false;

    /** @type {number} - Initial Y-coordinate of the mouse when the mode is activated */
    let startY = 0;

    /** @type {number} - The current amount to scroll continuously */
    let scrollAmount = 0;

    /** @type {number | null} - ID for storing requestAnimationFrame */
    let animationFrameId = null;

    /** @type {HTMLElement | Window | null} - The element to be scrolled. Can be an element or the window itself. */
    let scrollTargetElement = null; // --- NEW: To store the scroll target

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
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="white" width="32" height="32"><circle cx="16" cy="16" r="3"/><path d="M16 4 L12 8 L20 8 Z M16 28 L12 24 L20 24 Z"/></svg>');
            background-size: 80%;
            background-repeat: no-repeat;
            background-position: center;
            /* --- TASTEFUL BLUR EFFECT --- */
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px); /* For Safari support */
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
        // --- MODIFIED: Use the dynamic scroll target ---
        if (scrollAmount !== 0 && scrollTargetElement) {
            scrollTargetElement.scrollBy(0, scrollAmount);
        }
        animationFrameId = requestAnimationFrame(performScroll);
    };

    // --- Function to activate scroll mode ---
    const activateScrollMode = (e) => {
        // --- Find the scrollable parent element ---
        let currentElement = e.target;
        while (currentElement && currentElement !== document.body) {
            // Check if the element is vertically scrollable
            if (currentElement.scrollHeight > currentElement.clientHeight) {
                scrollTargetElement = currentElement;
                break; // Found the target, exit loop
            }
            currentElement = currentElement.parentElement;
        }

        // If no specific element was found, fall back to the window
        if (!scrollTargetElement) {
            scrollTargetElement = window;
        }
        // --- Found the scrollable parent element ---

        isScrollModeActive = true;
        startY = e.clientY;
        document.body.style.cursor = 'all-scroll';

        indicator.style.left = `${e.clientX - 16}px`;
        indicator.style.top = `${e.clientY - 16}px`;
        indicator.style.display = 'block';

        // Start the scroll loop
        performScroll();
    };

    // --- Encapsulated logic for deactivating scroll mode for reusability ---
    const deactivateScrollMode = () => {
        isScrollModeActive = false;
        document.body.style.cursor = 'default';
        indicator.style.display = 'none';
        scrollAmount = 0; // Reset the scroll amount
        scrollTargetElement = null; // --- NEW: Reset the scroll target
        // The loop will automatically stop on the next performScroll check
    };

    /**
     * Mouse down event handler, used to activate the mode
     * @param {MouseEvent} e
     */
    const handleMouseDown = (e) => {
        // e.button === 1 -> Middle click
        if (e.button === 1) {
            e.preventDefault(); // Prevent the default middle-click behavior
            if (!isScrollModeActive) {
                activateScrollMode(e);
            }
        }
    };

    /**
     * Mouse up event handler, used to deactivate the mode
     * @param {MouseEvent} e
     */
    const handleMouseUp = (e) => {
        // e.button === 1 -> Middle click
        if (e.button === 1 && isScrollModeActive) {
            e.preventDefault();
            deactivateScrollMode();
        }
    };


    /**
     * Mouse move event handler, used only to update scroll speed and direction
     * @param {MouseEvent} e
     */
    const handleMouseMove = (e) => {
        if (!isScrollModeActive) return;

        const currentY = e.clientY;
        const deltaY = currentY - startY;

        scrollAmount = deltaY * SENSITIVITY_FACTOR;
    };

    // Bind event listeners
    window.addEventListener('mousedown', handleMouseDown, true); // Use the capture phase to handle it first
    window.addEventListener('mouseup', handleMouseUp, true);     // Use the capture phase to handle it first
    window.addEventListener('mousemove', handleMouseMove, false);
    window.addEventListener('contextmenu', (e) => {
        if (isScrollModeActive) {
            e.preventDefault(); // Prevent context menu while scrolling
        }
    }, true);


})();
