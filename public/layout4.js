(function() {
    // S22 WordPress Integration Script - Layout 4 (Info Cards)
    const container = document.getElementById('s22-plugin-container');
    if (!container) return;

    const licenseKey = container.getAttribute('data-license');
    const domain = window.location.origin.replace(/\/$/, '');

    // Determine base URL from the script source itself
    const scriptSrc = document.currentScript ? document.currentScript.src : 'http://localhost:3000';
    const baseUrl = new URL(scriptSrc).origin;

    async function loadLayout() {
        try {
            const response = await fetch(`${baseUrl}/api/layout-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    license_key: licenseKey,
                    domain: domain,
                    layout_id: 'layout_4'
                })
            });

            const result = await response.json();
            if (result.success) {
                container.innerHTML = `
                    <div class="s22-embed-container" style="width: 100%; min-height: 600px; position: relative;">
                        <iframe 
                            src="${result.embed_url}" 
                            style="width: 100%; height: 100%; min-height: 600px; border: none; overflow: hidden; display: block;"
                            scrolling="no"
                            loading="lazy"
                        ></iframe>
                    </div>
                `;
            } else {
                container.innerHTML = `<div style="color: red; padding: 20px; border: 1px solid red;">Error: ${result.reason}</div>`;
            }
        } catch (e) {
            console.error("S22 Plugin Error:", e);
        }
    }

    loadLayout();
})();
