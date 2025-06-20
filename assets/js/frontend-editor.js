import { initializeEditor } from '@wordpress/edit-post';
import '@wordpress/format-library';

// Initialize Gutenberg editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const editorContainer = document.getElementById('frontend-editor-app');
    
    if (editorContainer) {
        try {
            // Initialize the editor with minimal configuration
            initializeEditor('frontend-editor-app', 'managed_content', 0, {
                alignWide: true,
                disableCustomColors: false,
                disableCustomFontSizes: false,
                disablePostFormats: true,
                titlePlaceholder: 'Add title',
                bodyPlaceholder: 'Start writing your content here...',
                isRTL: false,
                supportsLayout: true,
                supportsTemplateMode: false,
                canUserUseUnfilteredHTML: true
            }, {});
            
        } catch (error) {
            console.error('Failed to initialize Gutenberg editor:', error);
            
            // Fallback if initialization fails
            editorContainer.innerHTML = `
                <div class="editor-loading">
                    <p>Failed to load Gutenberg editor</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    }
});