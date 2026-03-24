(function() {
  /**
   * Solution22 eCommerce Embed Widget
   * Version: 1.0.1
   */

  const CONFIG = window.S22EcommerceConfig || {
    domain: window.location.origin
  };

  const BASE_URL = CONFIG.domain;
  const ID = 's22-ecommerce-iframe';

  function createWidget() {
    const container = document.createElement('div');
    container.id = 's22-ecommerce-wrapper';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      background: #fff;
      display: flex;
      flex-direction: column;
      animation: s22FadeIn 0.3s ease-out;
    `;

    const iframe = document.createElement('iframe');
    iframe.id = ID;
    iframe.src = BASE_URL;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      flex-grow: 1;
    `;
    iframe.allow = "payment; clipboard-read; clipboard-write; fullscreen";

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes s22FadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }
      body { overflow: hidden !important; }
    `;

    document.head.appendChild(style);
    container.appendChild(iframe);
    document.body.appendChild(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

})();
