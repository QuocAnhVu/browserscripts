# Browser Scripts

This repository contains a collection of personal browser scripts. These scripts can be used to customize website behavior, add new features, or automate tasks directly in your browser.

## Script Runners

To use these scripts, you need a browser extension that can manage and inject user scripts into web pages. Here are some popular options:

### [Tampermonkey](https://www.tampermonkey.net/)

- **Pros:**
  - Available for all major browsers (Chrome, Firefox, Edge, Safari, Opera).
  - Feature-rich with a built-in editor, script synchronization via cloud services, and a clear user interface.
  - Large user base and active development.

- **Cons:**
  - Closed-source, which may be a concern for some users.

### [Greasemonkey](https://www.greasespot.net/)

- **Pros:**
  - The original user script manager, open-source and well-respected.
  - Strong focus on security and script isolation.

- **Cons:**
  - Officially only available for Firefox.

### [Violentmonkey](https://violentmonkey.github.io/)

- **Pros:**
  - Open-source and available for multiple browsers (Chrome, Firefox, Edge).
  - Supports modern script features and has a clean interface.
  - Can sync scripts with cloud services (Dropbox, OneDrive, etc.).

- **Cons:**
  - Smaller user base compared to Tampermonkey.

## Available Scripts

### Middle Click Scroll (`middle-click-scroll.js`)

Hold down the middle mouse button to scroll smoothly in any direction. The script independently targets horizontal and vertical scroll elements under the cursor, providing omni-directional scrolling with visual feedback.

**Features:**
- Independent horizontal and vertical scrolling
- Visual indicator showing scroll mode is active
- Ignores middle-clicks on links (preserves default "open in new tab" behavior)
- Adjustable sensitivity
- Works on all websites

**Usage:** Install the script and hold down your middle mouse button anywhere on a page to activate scroll mode. Move your mouse away from the starting point to control scroll direction and speed.

### Claude Code Sidebar Toggle (`claude-sidebar-toggle.js`)

Adds a toggle button to collapse/expand the Claude Code sidebar, freeing up screen space when working on smaller displays.

**Features:**
- Toggle button integrated into the title bar (left of chat title)
- Instantly collapses sidebar from 600px to 0px
- Matches Claude's UI styling
- Works on claude.ai

**Usage:** Click the toggle button (« / ») in the title bar to collapse or expand the sidebar.
