(function() {
  /**
   * Solution22 eCommerce Embed Widget
   * Version: 1.0.0
   * This script allows the full Next.js eCommerce flow to be embedded into any external website.
   */

  const CONFIG = window.S22EcommerceConfig || {
    domain: window.location.origin,
    projectId: "S22-DEFAULT-PROJECT"
  };

  const BASE_URL = CONFIG.domain;
  const ID = 's22-ecommerce-iframe';

  function createWidget() {
    // 1. Create Iframe Container
    const container = document.createElement('div');
    container.id = 's22-ecommerce-wrapper';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483647;
      background: #fff;
      display: flex;
      flex-direction: column;
      animation: s22FadeIn 0.3s ease-out;
    `;

    // 2. Headless Header (Optional Close Button if not desired by user)
    // The user asked for "full screen script", usually these take over the whole viewport.

    // 3. Create the Iframe
    const iframe = document.createElement('iframe');
    iframe.id = ID;
    iframe.src = BASE_URL;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      flex-grow: 1;
    `;
    iframe.allow = "payment; clipboard-read; clipboard-write";

    // 4. Add CSS Animations
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes s22FadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }
      body { overflow: hidden !important; } /* Prevent host page scrolling while widget is open */
    `;

    // 5. Append everything
    document.head.appendChild(style);
    container.appendChild(iframe);
    document.body.appendChild(container);
    
    console.log("Solution22 eCommerce Widget initialized on " + window.location.hostname);
  }

  // Auto-init based on configuration
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

})();
