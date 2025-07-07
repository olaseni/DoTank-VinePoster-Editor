import { Button, Panel, PanelBody } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import FeaturedImage from './FeaturedImage';
import Tags from './Tags';
import BlockInserterButton from './BlockInserterButton';

const EditorSidebar = ({ onInsertBlock, onPreviewClick, postId, currentSelectedBlock, blocks }) => {
    
    // Feature flags
    const SHOW_FEATURED_IMAGE = false;
    const SHOW_TAGS = false;
    
    // Helper function to find a block by clientId in the blocks tree
    const findBlockByClientId = (clientId, blocksArray) => {
        for (const block of blocksArray) {
            if (block.clientId === clientId) {
                return block;
            }
            if (block.innerBlocks && block.innerBlocks.length > 0) {
                const found = findBlockByClientId(clientId, block.innerBlocks);
                if (found) return found;
            }
        }
        return null;
    };

    // Helper function to find the parent container of a selected block
    const findParentContainer = (selectedClientId, blocksArray, parent = null) => {
        for (const block of blocksArray) {
            if (block.clientId === selectedClientId) {
                return parent;
            }
            if (block.innerBlocks && block.innerBlocks.length > 0) {
                const found = findParentContainer(selectedClientId, block.innerBlocks, block);
                if (found !== null) return found;
            }
        }
        return null;
    };

    // Check if a block type is allowed in the current context
    const isBlockTypeAllowed = (blockType) => {
        if (!currentSelectedBlock?.clientId) return false;

        // Find the parent container
        const parentContainer = findParentContainer(currentSelectedBlock.clientId, blocks);
        
        if (!parentContainer) return false;

        // Check if parent container is locked
        if (parentContainer.attributes?.templateLock === 'all' || 
            parentContainer.attributes?.templateLock === 'insert') {
            return false;
        }

        // Check allowedBlocks
        const allowedBlocks = parentContainer.attributes?.allowedBlocks;
        if (allowedBlocks && Array.isArray(allowedBlocks)) {
            return allowedBlocks.includes(blockType);
        }

        // If no allowedBlocks restriction, allow insertion in editable containers
        const editableContainers = ['core/group', 'core/column'];
        return editableContainers.includes(parentContainer.name);
    };

    const handleInsertBlock = (blockType, attributes = {}) => {
        let newBlock;
        
        // Handle columns block creation with inner column blocks
        if (blockType === 'core/columns') {
            const columnCount = attributes.columns || 2;
            const innerBlocks = [];
            
            // Create the specified number of column blocks
            for (let i = 0; i < columnCount; i++) {
                innerBlocks.push(createBlock('core/column', {}, [
                    createBlock('core/paragraph', { 
                        placeholder: 'Add content...'
                    })
                ]));
            }
            
            newBlock = createBlock(blockType, attributes, innerBlocks);
        } else {
            newBlock = createBlock(blockType, attributes);
        }
        
        if (onInsertBlock) {
            onInsertBlock(newBlock);
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
                                if (onPreviewClick && postId) {
                                    onPreviewClick();
                                } else {
                                    console.log('No published post to preview');
                                }
                            }}
                            disabled={!postId}
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

            {/* All sections in one Panel for proper Gutenberg collapsible behavior */}
            <Panel>
                <PanelBody title="Columns" initialOpen={true}>
                    <div className="columns-grid">
                        <BlockInserterButton
                            blockType="core/columns"
                            attributes={{ columns: 1 }}
                            isAllowed={isBlockTypeAllowed('core/columns')}
                            onInsert={handleInsertBlock}
                            title="Single Column"
                            className="column-option"
                        >
                            <div className="column-preview single-column">
                                <div className="column-bar"></div>
                            </div>
                        </BlockInserterButton>
                        <BlockInserterButton
                            blockType="core/columns"
                            attributes={{ columns: 2 }}
                            isAllowed={isBlockTypeAllowed('core/columns')}
                            onInsert={handleInsertBlock}
                            title="Two Columns"
                            className="column-option"
                        >
                            <div className="column-preview double-column">
                                <div className="column-bar"></div>
                                <div className="column-bar"></div>
                            </div>
                        </BlockInserterButton>
                    </div>
                </PanelBody>

                <PanelBody title="Blocks" initialOpen={true}>
                    <div className="blocks-grid">
                        <BlockInserterButton
                            blockType="core/paragraph"
                            attributes={{ placeholder: 'Start writing...' }}
                            isAllowed={isBlockTypeAllowed('core/paragraph')}
                            onInsert={handleInsertBlock}
                            title="Text Block"
                        >
                            <div className="block-icon text-icon">
                                <span>A</span>
                            </div>
                        </BlockInserterButton>
                        <BlockInserterButton
                            blockType="core/image"
                            attributes={{ caption: '' }}
                            isAllowed={isBlockTypeAllowed('core/image')}
                            onInsert={handleInsertBlock}
                            title="Image Block"
                        >
                            <div className="block-icon image-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M19 7v10H5V7h14m0-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-5 6l-3 3.72L9 13l-3 4h12l-4-5z"/>
                                </svg>
                            </div>
                        </BlockInserterButton>
                        <BlockInserterButton
                            blockType="core/video"
                            attributes={{}}
                            isAllowed={isBlockTypeAllowed('core/video')}
                            onInsert={handleInsertBlock}
                            title="Media Block"
                        >
                            <div className="block-icon media-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                                </svg>
                            </div>
                        </BlockInserterButton>
                        <BlockInserterButton
                            blockType="core/button"
                            attributes={{ text: 'Click me', url: '' }}
                            isAllowed={isBlockTypeAllowed('core/button')}
                            onInsert={handleInsertBlock}
                            title="Button Block"
                        >
                            <div className="block-icon button-icon">
                                <span>Button</span>
                                <svg viewBox="0 0 24 24" width="12" height="12">
                                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                                </svg>
                            </div>
                        </BlockInserterButton>
                    </div>
                </PanelBody>

                {SHOW_FEATURED_IMAGE && (
                    <PanelBody title="Featured Image" initialOpen={false}>
                        <FeaturedImage />
                    </PanelBody>
                )}

                {SHOW_TAGS && (
                    <PanelBody title="Tags" initialOpen={false}>
                        <Tags />
                    </PanelBody>
                )}
            </Panel>
        </div>
    );
};

export default EditorSidebar;