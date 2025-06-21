import { Button, Panel, PanelBody, PanelRow } from '@wordpress/components';

const EditorSidebar = () => {
    return (
        <div className="editor-sidebar">
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
                        <div className="block-option" title="Text Block">
                            <div className="block-icon text-icon">
                                <span>A</span>
                            </div>
                        </div>
                        <div className="block-option" title="Image Block">
                            <div className="block-icon image-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M19 7v10H5V7h14m0-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-5 6l-3 3.72L9 13l-3 4h12l-4-5z"/>
                                </svg>
                            </div>
                        </div>
                        <div className="block-option" title="Media Block">
                            <div className="block-icon media-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                                </svg>
                            </div>
                        </div>
                        <div className="block-option" title="Button Block">
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