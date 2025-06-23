import { Button, Panel, PanelBody, PanelRow } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';

const EditorSidebar = ({ onInsertBlock, currentIndex = -1 }) => {
    
    const handleInsertBlock = (blockType, attributes = {}) => {
        const newBlock = createBlock(blockType, attributes);
        if (onInsertBlock) {
            onInsertBlock(newBlock, currentIndex);
        }
    };
    return (
        <div className="editor-sidebar">
            {/* Header Panel with Preview and Settings buttons */}
            <Panel className="sidebar-panel">
                <PanelBody initialOpen={true}>
                    <div className="sidebar-header">
                        <Button 
                            variant="primary" 
                            className="preview-button"
                            onClick={() => {
                                // Preview functionality
                                console.log('Preview clicked');
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Z"/>
                            </svg>
                            Preview
                        </Button>
                        <Button 
                            variant="tertiary" 
                            className="settings-button"
                            onClick={() => {
                                // Settings functionality
                                console.log('Settings clicked');
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
                            </svg>
                        </Button>
                    </div>
                </PanelBody>
            </Panel>

            {/* Columns Section */}
            <Panel className="sidebar-panel">
                <PanelBody title="COLUMNS" initialOpen={true}>
                    <div className="columns-grid">
                        <div className="column-option">
                            <div className="column-preview single-column">
                                <div className="column-bar"></div>
                            </div>
                        </div>
                        <div className="column-option">
                            <div className="column-preview double-column">
                                <div className="column-bar"></div>
                                <div className="column-bar"></div>
                            </div>
                        </div>
                    </div>
                </PanelBody>
            </Panel>

            {/* Blocks Section */}
            <Panel className="sidebar-panel">
                <PanelBody title="BLOCKS" initialOpen={true}>
                    <div className="blocks-grid">
                        <div 
                            className="block-option" 
                            title="Text Block"
                            onClick={() => handleInsertBlock('core/paragraph', { placeholder: 'Start writing...' })}
                        >
                            <div className="block-icon text-icon">
                                <span>A</span>
                            </div>
                        </div>
                        <div 
                            className="block-option" 
                            title="Image Block"
                            onClick={() => handleInsertBlock('core/image', { caption: '' })}
                        >
                            <div className="block-icon image-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M19 7v10H5V7h14m0-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-5 6l-3 3.72L9 13l-3 4h12l-4-5z"/>
                                </svg>
                            </div>
                        </div>
                        <div 
                            className="block-option" 
                            title="Media Block"
                            onClick={() => handleInsertBlock('core/video', {})}
                        >
                            <div className="block-icon media-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                                </svg>
                            </div>
                        </div>
                        <div 
                            className="block-option" 
                            title="Button Block"
                            onClick={() => handleInsertBlock('core/button', { text: 'Click me', url: '' })}
                        >
                            <div className="block-icon button-icon">
                                <span>Button</span>
                                <svg viewBox="0 0 24 24" width="12" height="12">
                                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="blocks-divider"></div>
                </PanelBody>
            </Panel>

            {/* Featured Image Section */}
            <Panel className="sidebar-panel">
                <PanelBody title="Featured Image" initialOpen={true}>
                    <div className="featured-image-container">
                        <div className="featured-image-placeholder">
                            <div className="image-placeholder-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24">
                                    <path d="M19 7v10H5V7h14m0-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-5 6l-3 3.72L9 13l-3 4h12l-4-5z"/>
                                </svg>
                            </div>
                        </div>
                        <Button 
                            variant="secondary" 
                            className="featured-image-button"
                            isSmall
                        >
                            Set Featured Image
                        </Button>
                    </div>
                </PanelBody>
            </Panel>

            {/* Tags Section */}
            <Panel className="sidebar-panel">
                <PanelBody title="Tags" initialOpen={true}>
                    <div className="tags-container">
                        <div className="tag-buttons">
                            <Button 
                                variant="secondary" 
                                className="tag-button"
                                isSmall
                            >
                                TAG 1
                            </Button>
                            <Button 
                                variant="secondary" 
                                className="tag-button"
                                isSmall
                            >
                                TAG 2
                            </Button>
                        </div>
                        <Button 
                            variant="link" 
                            className="add-tag-button"
                            isSmall
                        >
                            + Add Tag
                        </Button>
                    </div>
                </PanelBody>
            </Panel>
        </div>
    );
};

export default EditorSidebar;