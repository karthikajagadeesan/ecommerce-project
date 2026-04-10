(function() {
    // S22 WordPress Master Widget - Selection and License Handler
    const container = document.getElementById('s22-plugin-container');
    if (!container) return;

    const licenseKey = container.getAttribute('data-license');
    const domain = window.location.origin.replace(/\/$/, '');
    
    // Determine base URL from the script source itself
    const scriptSrc = document.currentScript ? document.currentScript.src : 'http://localhost:3000';
    const baseUrl = new URL(scriptSrc).origin;

    async function initializePlugin() {
        try {
            // First, validate the license to get the plan
            const response = await fetch(`${baseUrl}/api/validate-license`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    license_key: licenseKey,
                    domain: domain
                })
            });

            const validation = await response.json();
            if (validation.valid) {
                renderSelectionUI(validation.plan, validation.user_name, validation.layouts);
            } else {
                container.innerHTML = `<div style="color: red; padding: 20px;">License Validation Failed: ${validation.reason}</div>`;
            }
        } catch (e) {
            console.error("S22 Master Widget Error:", e);
        }
    }

    function renderSelectionUI(plan, userName, layouts) {
        const isPremium = plan.toLowerCase() === 'premium';
        const maxSelection = isPremium ? 2 : 1;
        
        // Inject primary design tokens and hover effects via style tag
        if (!document.getElementById('s22-plugin-styles')) {
            const style = document.createElement('style');
            style.id = 's22-plugin-styles';
            style.innerHTML = `
                :root {
                    --s22-primary: #2563eb; /* Blue primary found in globals.css context */
                    --s22-primary-hover: #1d4ed8;
                    --s22-bg-light: #f9fafb;
                    --s22-foreground: #29344bff;
                    --s22-muted: #428df6ff;
                    --s22-border: #e5e7eb;
                    --s22-shadow: rgba(0,0,0,0.08);
                }
                .s22-selection-ui { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                .s22-selection-ui div[id^="layout-preview-"]:hover { border-color: var(--s22-primary) !important; transform: translateY(-4px); box-shadow: 0 12px 24px var(--s22-shadow) !important; }
            `;
            document.head.appendChild(style);
        }

        // Use the defined CSS variables for structural layout
        container.innerHTML = `
            <div class="s22-selection-ui" style="padding: 24px; background: var(--s22-bg-light); border: 1px solid var(--s22-border); border-radius: 20px; width: 100%; max-width: 1200px; margin: 0 auto; box-shadow: 0 20px 50px var(--s22-shadow);">
                <div style="margin-bottom: 40px; text-align: center;">
                    <h3 style="margin: 0; font-size: 28px; color: var(--s22-foreground); font-weight: 800; letter-spacing: -0.025em;">Choose Your Layout</h3>
                    <p style="margin: 12px 0 0; color: var(--s22-muted); font-size: 16px;">Welcome back, <b>${userName}</b>! You are on the <span style="text-transform: capitalize; color: var(--s22-primary); font-weight: 700;">${plan}</span> plan.</p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 48px;">
                    ${layouts.map(layout => {
                        const layoutIdString = layout.layout_name; // e.g. "layout_1"
                        const id = layoutIdString.split('_').pop();
                        const layoutTitle = id === '1' ? 'Grid Rotation Layout' : id === '2' ? 'Accordion Slider Layout' : id === '3' ? 'Pattern Grid Layout' : id === '4' ? 'Info Cards Layout' : `Layout #${id}`;

                        return `
                            <div id="layout-preview-${id}" 
                                 style="border: 1px solid var(--s22-border); border-radius: 20px; overflow: hidden; background: #fff; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                                <div style="padding: 20px 32px; background: #fff; border-bottom: 1px solid var(--s22-border); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 32px; height: 32px; background: var(--s22-foreground); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">${id}</div>
                                        <h4 style="margin: 0; font-size: 18px; color: var(--s22-foreground); font-weight: 700;">${layoutTitle}</h4>
                                    </div>
                                    <button 
                                        onclick="window.__s22LoadLayout('${layoutIdString}')"
                                        style="padding: 10px 28px; background: var(--s22-primary); color: #fff; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);"
                                        onmouseover="this.style.background='var(--s22-primary-hover)'; this.style.transform='scale(1.02)'"
                                        onmouseout="this.style.background='var(--s22-primary)'; this.style.transform='scale(1)'"
                                    >Activate ${layoutTitle}</button>
                                </div>
                                <div style="height: 650px; overflow: hidden; background: #ffffff; position: relative;">
                                    <iframe 
                                        src="${baseUrl}/embed/layout/${layoutIdString}" 
                                        style="width: 100%; height: 100%; border: none; overflow: hidden; display: block;"
                                        scrolling="no"
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div id="s22-status-msg" style="margin-top: 40px; text-align: center; color: #9ca3af; font-size: 14px;"></div>
            </div>
        `;

        // Inject hover effects via style tag
        if (!document.getElementById('s22-plugin-styles')) {
            const style = document.createElement('style');
            style.id = 's22-plugin-styles';
            style.innerHTML = `
                .s22-selection-ui div[id^="layout-card-"]:hover { border-color: #2563eb !important; transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important; }
            `;
            document.head.appendChild(style);
        }

        // Exposed global loader function
        window.__s22LoadLayout = async function(layoutId) {
            // Dispatch event to allow WordPress to capture the selection
            window.parent.postMessage({ type: 'S22_LAYOUT_SELECTED', layoutId: layoutId }, '*');
            window.dispatchEvent(new CustomEvent('s22LayoutSelected', { detail: { layoutId: layoutId } }));

            const msg = document.getElementById('s22-status-msg');
            msg.innerHTML = "Requesting UI for " + layoutId + "...";

            try {
                const response = await fetch(`${baseUrl}/api/layout-data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        license_key: licenseKey,
                        domain: domain,
                        layout_id: layoutId
                    })
                });

                const result = await response.json();
                if (result.success) {
                    msg.innerHTML = `<span style="color: green;">Layout ${layoutId} Authorized! Loading...</span>`;
                    
                    // Transition to the separate layout script
                    setTimeout(() => {
                        const script = document.createElement('script');
                        script.src = baseUrl + '/' + layoutId.replace('_', '') + '.js';
                        document.body.appendChild(script);
                    }, 800);
                } else {
                    msg.innerHTML = `<span style="color: #dc2626; font-weight: bold;">Error: ${result.reason}</span>`;
                }
            } catch (e) {
                msg.innerHTML = "Network error occurred.";
            }
        };
    }

    initializePlugin();
})();
