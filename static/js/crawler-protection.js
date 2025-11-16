/**
 * LLM Crawler Protection System
 * Adapted for static sites - uses localStorage instead of cookies
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    VALIDATION_KEY: 'visitor_validated',
    CRAWLER_DETECTED_KEY: 'crawler_detected',
    VALIDATION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    HONEYPOT_PATHS: ['/heck-off/', '/crawler-trap/'],
    BLOCKED_USER_AGENTS: [
      'GPTBot', 'ChatGPT', 'CCBot', 'anthropic-ai', 'Claude-Web',
      'Google-Extended', 'PerplexityBot', 'Omgilibot', 'FacebookBot',
      'cohere-ai', 'Bytespider', 'Diffbot'
    ]
  };

  /**
   * Check if current path is a honeypot
   */
  function isHoneypotPath() {
    const path = window.location.pathname;
    return CONFIG.HONEYPOT_PATHS.some(honeypot => path.startsWith(honeypot));
  }

  /**
   * Check if user agent matches known crawler patterns
   */
  function isKnownCrawler() {
    const ua = navigator.userAgent;
    return CONFIG.BLOCKED_USER_AGENTS.some(crawler =>
      ua.includes(crawler)
    );
  }

  /**
   * Check if visitor is validated
   */
  function isValidated() {
    try {
      const validated = localStorage.getItem(CONFIG.VALIDATION_KEY);
      if (!validated) return false;

      const timestamp = parseInt(validated, 10);
      const now = Date.now();

      // Check if validation is still valid
      if (now - timestamp < CONFIG.VALIDATION_DURATION) {
        return true;
      } else {
        // Validation expired
        localStorage.removeItem(CONFIG.VALIDATION_KEY);
        return false;
      }
    } catch(e) {
      // localStorage not available
      return false;
    }
  }

  /**
   * Check if crawler was detected via honeypot
   */
  function wasCrawlerDetected() {
    try {
      return localStorage.getItem(CONFIG.CRAWLER_DETECTED_KEY) !== null;
    } catch(e) {
      return false;
    }
  }

  /**
   * Mark visitor as validated
   */
  function markAsValidated() {
    try {
      localStorage.setItem(CONFIG.VALIDATION_KEY, Date.now().toString());
    } catch(e) {
      // localStorage not available - can't validate
    }
  }

  /**
   * Block crawler access
   */
  function blockCrawler(reason) {
    // Log the block event
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({
        path: '/blocked-crawler',
        title: 'Crawler Blocked: ' + reason,
        event: true
      });
    }

    // Hide all content
    document.documentElement.style.display = 'none';

    // Show minimal message
    document.body.innerHTML =
      '<div style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto;">' +
      '<h1>Access Denied</h1>' +
      '<p>Automated crawler detected. This site does not permit scraping.</p>' +
      '<p>If you believe this is an error, please contact the site administrator.</p>' +
      '<p>Reason: ' + reason + '</p>' +
      '</div>';
    document.documentElement.style.display = '';
  }

  /**
   * Main protection logic
   */
  function enforceCrawlerProtection() {
    // If already validated, allow access
    if (isValidated()) {
      return;
    }

    // If crawler was previously detected, block immediately
    if (wasCrawlerDetected()) {
      blockCrawler('Previously detected via honeypot');
      return;
    }

    // If user agent matches known crawler, block
    if (isKnownCrawler()) {
      blockCrawler('Known crawler user agent');
      return;
    }

    // If this is a honeypot path, mark as crawler
    if (isHoneypotPath()) {
      try {
        localStorage.setItem(CONFIG.CRAWLER_DETECTED_KEY, Date.now().toString());
        localStorage.setItem('crawler_trap_page', window.location.pathname);
      } catch(e) {
        // Can't set localStorage
      }
      // Don't block on honeypot page itself, let the template handle it
      return;
    }

    // First-time visitor - mark as validated
    markAsValidated();
  }

  // Run protection immediately (before page renders)
  enforceCrawlerProtection();

  // Also run on DOMContentLoaded for additional safety
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enforceCrawlerProtection);
  }
})();
