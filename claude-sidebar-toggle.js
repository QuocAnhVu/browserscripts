// ==UserScript==
// @name         Claude Code Sidebar Toggle
// @namespace    http://tampermonkey.net/
// @version      3
// @description  Toggle Claude Code sidebar visibility with a button (collapse to 0px / expand to 600px)
// @author       quoc.v.anh@gmail.com
// @match        https://claude.ai/*
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    const SIDEBAR_WIDTH_EXPANDED = '600px';
    const SIDEBAR_WIDTH_COLLAPSED = '0px';

    let sidebar = null;
    let toggleButton = null;
    let titleBarContainer = null;
    let isCollapsed = false;

    // Inject styles for the toggle button
    GM_addStyle(`
        #sidebar-toggle-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 32px;
            height: 100%;
            border-radius: 0.5rem;
            background-color: transparent;
            border: none;
            cursor: pointer;
            font-size: 18px;
            color: var(--text-100, #3c3c3c);
            transition: all 0.2s ease;
            user-select: none;
            margin-right: 0.25rem;
        }

        #sidebar-toggle-btn:hover {
            background-color: var(--bg-200, #f4f4f4);
        }

        #sidebar-toggle-btn:active {
            transform: scale(0.95);
        }
    `);

    /**
     * Find the sidebar element on the page
     */
    function findSidebar() {
        // Look for div with inline style width: 600px
        const elements = document.querySelectorAll('div[style*="width: 600px"]');

        // Additional validation: should have classes that match sidebar
        for (let el of elements) {
            if (el.classList.contains('flex-shrink-0') &&
                el.classList.contains('overflow-y-auto')) {
                return el;
            }
        }

        // Fallback: just return first match if validation fails
        return elements[0] || null;
    }

    /**
     * Find the title bar container where we'll insert the button
     */
    function findTitleBarContainer() {
        // Look for the sticky header with backdrop blur
        const headers = document.querySelectorAll('.sticky.top-0');

        for (let header of headers) {
            // Check if it has the backdrop blur and border classes
            const backdropDiv = header.querySelector('.backdrop-blur-md.border-b-\\[0\\.5px\\]');
            if (backdropDiv) {
                // Find the flex container inside
                const flexContainer = backdropDiv.querySelector('.px-3.py-2.flex.items-center.gap-1');
                if (flexContainer) {
                    return flexContainer;
                }
            }
        }

        return null;
    }

    /**
     * Create the toggle button
     */
    function createToggleButton() {
        const button = document.createElement('button');
        button.id = 'sidebar-toggle-btn';
        button.setAttribute('aria-label', 'Toggle sidebar');
        button.className = isCollapsed ? 'collapsed' : 'expanded';
        updateButtonIcon(button);

        button.addEventListener('click', toggleSidebar);

        return button;
    }

    /**
     * Insert the toggle button into the title bar
     */
    function insertToggleButton() {
        if (!titleBarContainer || !toggleButton) return false;

        // Insert as the first child of the flex container
        titleBarContainer.insertBefore(toggleButton, titleBarContainer.firstChild);
        return true;
    }

    /**
     * Update button icon based on state
     */
    function updateButtonIcon(button) {
        // Use « for expanded (click to collapse), » for collapsed (click to expand)
        button.textContent = isCollapsed ? '»' : '«';
    }

    /**
     * Toggle sidebar visibility
     */
    function toggleSidebar() {
        if (!sidebar) return;

        isCollapsed = !isCollapsed;

        // Update sidebar width
        if (isCollapsed) {
            sidebar.style.width = SIDEBAR_WIDTH_COLLAPSED;
        } else {
            sidebar.style.width = SIDEBAR_WIDTH_EXPANDED;
        }

        // Update button state
        toggleButton.className = isCollapsed ? 'collapsed' : 'expanded';
        updateButtonIcon(toggleButton);
    }

    /**
     * Initialize the sidebar state from localStorage
     */
    function initializeSidebarState() {
        if (!sidebar) return;

        if (isCollapsed) {
            sidebar.style.width = SIDEBAR_WIDTH_COLLAPSED;
        }
    }

    /**
     * Initialize the script
     */
    function initialize() {
        // Find sidebar
        sidebar = findSidebar();

        // Find title bar container
        titleBarContainer = findTitleBarContainer();

        if (sidebar && titleBarContainer) {
            // Create toggle button if it doesn't exist
            if (!toggleButton) {
                toggleButton = createToggleButton();
            }

            // Insert button into title bar if not already inserted
            if (!document.body.contains(toggleButton)) {
                insertToggleButton();
            }

            // Apply initial state
            initializeSidebarState();
        } else {
            // Retry after a short delay if elements not found
            setTimeout(initialize, 500);
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Watch for DOM changes (in case elements are added dynamically)
    const observer = new MutationObserver((mutations) => {
        // Check if sidebar still exists
        if (!sidebar || !document.body.contains(sidebar)) {
            sidebar = findSidebar();
            if (sidebar) {
                initializeSidebarState();
            }
        }

        // Check if title bar container still exists
        if (!titleBarContainer || !document.body.contains(titleBarContainer)) {
            titleBarContainer = findTitleBarContainer();
        }

        // Check if button is still in the DOM
        if (toggleButton && !document.body.contains(toggleButton)) {
            if (titleBarContainer) {
                insertToggleButton();
            }
        }

        // If we have all elements but button isn't inserted, insert it
        if (sidebar && titleBarContainer && toggleButton && !document.body.contains(toggleButton)) {
            insertToggleButton();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
