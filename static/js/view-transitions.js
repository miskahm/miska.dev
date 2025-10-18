/**
 * View Transitions for smooth page navigation
 * Simple, elegant cross-fade transitions for internal links
 */

(function() {
  'use strict';

  // Check if View Transitions API is supported
  if (!document.startViewTransition) {
    return; // Graceful degradation - no transitions in unsupported browsers
  }

  /**
   * Check if a link is internal
   */
  function isInternalLink(url) {
    try {
      const linkUrl = new URL(url, window.location.origin);
      return linkUrl.origin === window.location.origin &&
             linkUrl.pathname !== window.location.pathname;
    } catch {
      return false;
    }
  }

  /**
   * Navigate with view transition
   */
  function navigateWithTransition(url) {
    document.startViewTransition(async () => {
      // Fetch the new page
      const response = await fetch(url);
      const html = await response.text();

      // Parse the HTML
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');

      // Update the document
      document.title = newDoc.title;
      document.body.innerHTML = newDoc.body.innerHTML;

      // Update URL without reload
      window.history.pushState({}, '', url);

      // Re-attach event listeners
      attachListeners();

      // Scroll to top
      window.scrollTo(0, 0);
    });
  }

  /**
   * Attach click listeners to internal links
   */
  function attachListeners() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');

      if (!link) return;

      const href = link.getAttribute('href');

      // Only handle internal links
      if (href && isInternalLink(href) && !link.hasAttribute('target')) {
        e.preventDefault();
        navigateWithTransition(href);
      }
    });
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    navigateWithTransition(window.location.href);
  });

  // Initialize
  attachListeners();
})();
