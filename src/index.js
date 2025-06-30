import { createRoot } from '@wordpress/element';
import { registerCoreBlocks } from '@wordpress/block-library';
import FrontendEditor from './FrontendEditor';


import './style.scss';
import './combined-block-styles.scss';

// Register all core blocks
registerCoreBlocks();

const editorRoot = document.getElementById('frontend-editor-root');

if (editorRoot && window.frontendEditorData) {
    console.log('Frontend Editor: Rendering full Gutenberg editor');
    const root = createRoot(editorRoot)
    root.render(<FrontendEditor />);
} else {
    console.error('Frontend Editor: Missing root element or data', {
        editorRoot,
        frontendEditorData: window.frontendEditorData
    });
}