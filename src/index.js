import { createRoot } from '@wordpress/element';
import { registerCoreBlocks } from '@wordpress/block-library';
import FrontendEditor from './FrontendEditor';
import { unregisterFormatType } from '@wordpress/rich-text';

import './style-editor.scss';

// Register all core blocks
registerCoreBlocks();

const formatsToRemove = [
    'core/strikethrough',
    'core/code',
    'core/image',
    'core/keyboard',
    'core/subscript',
    'core/superscript',
    'core/language',
    'core/underline',
    'core/text-color',
];

formatsToRemove.forEach(format => unregisterFormatType(format));

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
