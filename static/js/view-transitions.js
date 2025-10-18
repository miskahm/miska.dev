/**
 * View Transitions for smooth page navigation
 * Optimized for performance - minimal overhead, instant feel
 */

(function() {
  'use strict';

  // Check if View Transitions API is supported
  if (!document.startViewTransition) {
    return; // Graceful degradation
  }

  /**
   * Navigate with view transition
   */
  function navigateWithTransition(url) {
    // Start the transition immediately
    const transition = document.startViewTransition(() => {
      // Simply navigate - let browser handle page load
      window.location.href = url;
    });
  }

  /**
   * Intercept link clicks for transitions
   */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');

    if (!link) return;

    const href = link.getAttribute('href');

    // Only handle internal links (same origin, not external, not anchors)
    if (href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !link.hasAttribute('target') &&
        !href.startsWith('#') &&
        !href.startsWith('mailto:')) {

      e.preventDefault();
      navigateWithTransition(href);
    }
  });
})();
