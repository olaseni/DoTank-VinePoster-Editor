import { render } from '@wordpress/element';
import { registerCoreBlocks } from '@wordpress/block-library';
import FrontendGutenbergEditor from './FrontendGutenbergEditor';
import './style.scss';
import './combined-block-styles.scss';

// Register all core blocks
registerCoreBlocks();

console.log('Frontend Editor: Initializing full Gutenberg editor');
console.log('Frontend Editor Data:', window.frontendEditorData);

const editorRoot = document.getElementById('frontend-editor-root');

if (editorRoot && window.frontendEditorData) {
    console.log('Frontend Editor: Rendering full Gutenberg editor');
    render(<FrontendGutenbergEditor />, editorRoot);
} else {
    console.error('Frontend Editor: Missing root element or data', {
        editorRoot,
        frontendEditorData: window.frontendEditorData
    });
}