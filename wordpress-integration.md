# WordPress Integration Guide: Image Selection & Layout Submission

This guide explains how to implement the layout selection and image upload workflow in WordPress, integrating with the Next.js eCommerce backend widget.

## 1. Prerequisites
- A functional WordPress installation.
- The Next.js API URL: `https://your-nextjs-app.com/api/wordpress/submit-layout`
- A valid License Key for authentication.

## 2. Implementation Flow

### A. The HTML Structure
Add this to your WordPress page or template where you want the layout selector to appear. The First div holds the Next.js UI selection script.

```html
<div id="layout-submission-container">
    <!-- Next.js layout selection widget will render here -->
    <div id="s22-plugin-container" data-license="YOUR_LICENSE_KEY"></div>
    <!-- Load the widget from your Next.js application -->
    <script src="https://your-nextjs-app.com/widget.js"></script>

    <!-- The Image Upload section (Hidden by default) -->
    <div id="upload-section" style="display:none; margin-top: 20px;">
        <h3>Upload Images for <span id="selected-layout-name"></span></h3>
        <button id="wp-media-upload" class="button">Select Images</button>
        <div id="image-preview" style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;"></div>
        <button id="submit-to-ecommerce" class="button button-primary" style="margin-top: 20px;">Submit to Store</button>
    </div>

    <!-- Final Rendered Layout Container -->
    <div id="render-container" style="margin-top: 40px;">
        <!-- The Next.js layout will be rendered here dynamically -->
    </div>
</div>
```

### B. The JavaScript Logic
This script listens for the layout selection from the widget, handles image uploads via WordPress Media Library, and submits data back to Next.js.

```javascript
jQuery(document).ready(function($) {
    let selectedLayout = '';
    let uploadedImages = [];
    const NEXTJS_API_URL = 'https://your-nextjs-app.com/api/wordpress/submit-layout';
    const LICENSE_KEY = 'YOUR_LICENSE_KEY'; // This should be dynamic

    // 1. Listen for layout selection from the Next.js Widget
    // It captures either a message (if in iframe) or a CustomEvent (if loaded inline)
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'S22_LAYOUT_SELECTED') {
            handleLayoutSelection(event.data.layoutId);
        }
    });

    window.addEventListener('s22LayoutSelected', function(event) {
        if (event.detail && event.detail.layoutId) {
            handleLayoutSelection(event.detail.layoutId);
        }
    });

    function handleLayoutSelection(layoutId) {
        selectedLayout = layoutId;
        $('#selected-layout-name').text(selectedLayout);
        
        // Hide the widget selection UI and show the WordPress Image Upload UI
        $('#s22-plugin-container').hide();
        $('#upload-section').show();
    }

    // 2. WordPress Media Uploader
    $('#wp-media-upload').on('click', function(e) {
        e.preventDefault();
        const frame = wp.media({
            title: 'Select or Upload Images',
            button: { text: 'Use these images' },
            multiple: true
        });

        frame.on('select', function() {
            const attachments = frame.state().get('selection').toJSON();
            $('#image-preview').empty();
            uploadedImages = attachments.map(img => ({
                id: img.id,
                url: img.url,
                alt: img.alt || img.title,
                width: img.width,
                height: img.height
            }));

            uploadedImages.forEach(img => {
                $('#image-preview').append(`<img src="${img.url}" style="width:100px; height:100px; object-fit:cover; border-radius:4px;">`);
            });
        });

        frame.open();
    });

    // 3. Submit to Next.js API
    $('#submit-to-ecommerce').on('click', function() {
        if (!selectedLayout || uploadedImages.length === 0) {
            alert('Please select a layout and upload at least one image.');
            return;
        }

        const data = {
            layout_id: selectedLayout,
            image_metadata: uploadedImages,
            license_key: LICENSE_KEY
        };

        $(this).prop('disabled', true).text('Submitting...');

        fetch(NEXTJS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                alert('Stored successfully in eCommerce database!');
                // Hide the upload section after success
                $('#upload-section').hide();
                // Use the returned submission ID for rendering
                renderLayout(res.data.layout_id, res.data.submission_id);
            } else {
                alert('Error: ' + res.message);
            }
        })
        .catch(err => {
            console.error('Submission failed:', err);
            alert('Server error occurred.');
        })
        .finally(() => {
            $(this).prop('disabled', false).text('Submit to Store');
        });
    });

    // 4. Dynamic Rendering
    function renderLayout(layoutId, submissionId) {
        // Construct the embed URL with the submission ID
        const embedUrl = `https://your-nextjs-app.com/embed/layout/${layoutId}?submission_id=${submissionId}`;
        $('#render-container').html(`
            <h3>Your Live Preview</h3>
            <iframe src="${embedUrl}" width="100%" height="600px" frameborder="0" style="border:1px solid #ddd; border-radius:8px;"></iframe>
        `);
    }
});
```

## 3. How it Works
1. **Next.js Widget**: The `widget.js` script fetches and visualizes the available layout UI inside your WordPress content.
2. **Selection Event**: When the user clicks to "Activate Layout" inside the widget, the widget broadcasts an `S22_LAYOUT_SELECTED` event containing the selected layout ID.
3. **Capture & Switch Context**: WordPress intercepts the Javascript event. It hides the Next.js widget layout container and displays the native WordPress `wp.media` image uploader UI.
4. **WordPress Side Storage**: The user handles the file uploads in WordPress, returning the public URLs and heights.
5. **Next.js Sync**: The WordPress script packages the `layout_id` and the `image_metadata`, sending them to Next.js via a POST API request. Next.js archives this inside the `layout_submissions` table.
6. **Final Render**: After success, WordPress gets a `submission_id` back and embeds an iframe to display the newly integrated layout with the active images.

## 4. PHP Hook (Optional)
To ensure the WP Media Library Javascript is reliably loaded, add this into your `functions.php`:

```php
function enqueue_layout_script() {
    wp_enqueue_media();
}
add_action('wp_enqueue_scripts', 'enqueue_layout_script');
```
