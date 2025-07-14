import { Button, Panel, PanelBody } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import FeaturedImage from './FeaturedImage';
import Tags from './Tags';
import BlockInserterButton from './BlockInserterButton';
import SettingsModal from './SettingsModal';

const EditorSidebar = ({ onPreviewClick, postId, currentSelectedBlock, blocks }) => {
    
    // Settings state
    const [showSettings, setShowSettings] = useState(false);
    const [editorSettings, setEditorSettings] = useState({
        // Author settings
        authors: [
            {
                name: '',
                bio: '',
                avatarUrl: '',
                email: '',
                website: ''
            }
        ],
        // Display settings
        showFeaturedImage: false,
        showTags: false
    });
    
    // Use settings to control feature flags
    const SHOW_FEATURED_IMAGE = editorSettings.showFeaturedImage;
    const SHOW_TAGS = editorSettings.showTags;
    
    // Get native WordPress block editor data with insertion context
    const {
        canInsertBlockType,
        insertionPoint,
        selectedBlockClientId
    } = useSelect((select) => {
        const blockEditorSelect = select('core/block-editor');
        
        return {
            canInsertBlockType: blockEditorSelect?.canInsertBlockType,
            insertionPoint: blockEditorSelect?.getBlockInsertionPoint?.() || null,
            selectedBlockClientId: blockEditorSelect?.getSelectedBlockClientId?.() || null
        };
    }, []);
    
    const { insertBlock } = useDispatch('core/block-editor');
    
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

    // Helper to check if a block is within an editable template container
    const isInEditableContainer = (clientId, blocksArray) => {
        for (const block of blocksArray) {
            if (block.clientId === clientId) {
                // Check if this block has editable class names
                const className = block.attributes?.className || '';
                return className.includes('editable-description') || 
                       className.includes('editable-main-content') ||
                       className.includes('template-footer');
            }
            if (block.innerBlocks && block.innerBlocks.length > 0) {
                const found = isInEditableContainer(clientId, block.innerBlocks);
                if (found) return true;
            }
        }
        return false;
    };

    // Helper to check if a block is a container type that can accept new blocks
    const isContainerBlock = (blockName) => {
        const containerTypes = ['core/group', 'core/column', 'core/columns', 'core/stack', 'core/row'];
        return containerTypes.includes(blockName);
    };

    // Get the selected block information
    const getSelectedBlockInfo = () => {
        if (!selectedBlockClientId) return null;
        
        const selectedBlock = findBlockByClientId(selectedBlockClientId, blocks);
        return selectedBlock;
    };

    // Check if blocks can be inserted in valid template containers only
    const isBlockTypeAllowed = (blockType) => {
        if (!canInsertBlockType) {
            return false;
        }
        
        const selectedBlock = getSelectedBlockInfo();
        
        // If a container block is selected, check if we can append to it
        if (selectedBlock && isContainerBlock(selectedBlock.name)) {
            // Check if the container is within an editable area
            if (isInEditableContainer(selectedBlock.clientId, blocks)) {
                try {
                    // Check if we can insert into the selected container
                    const result = canInsertBlockType(
                        blockType, 
                        selectedBlock.clientId, 
                        selectedBlock.innerBlocks?.length || 0
                    );
                    return result;
                } catch (error) {
                    return false;
                }
            }
        }
        
        // Otherwise, use the normal insertion point logic
        if (!insertionPoint || !insertionPoint.rootClientId) {
            return false;
        }
        
        // Ensure we're inserting within an editable template container
        if (!isInEditableContainer(insertionPoint.rootClientId, blocks)) {
            return false;
        }
        
        try {
            // Check if insertion is allowed with specific context
            const result = canInsertBlockType(
                blockType, 
                insertionPoint.rootClientId, 
                insertionPoint.index
            );
            return result;
        } catch (error) {
            return false;
        }
    };

    const handleInsertBlock = (blockType, attributes = {}) => {
        if (!insertBlock) {
            console.log('❌ insertBlock API not available');
            return;
        }
        
        try {
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
            
            const selectedBlock = getSelectedBlockInfo();
            
            // If a container block is selected, append to it
            if (selectedBlock && isContainerBlock(selectedBlock.name)) {
                // Append to the selected container
                const appendIndex = selectedBlock.innerBlocks?.length || 0;
                insertBlock(
                    newBlock,
                    appendIndex,
                    selectedBlock.clientId
                );
                console.log(`✅ Successfully appended ${blockType} to container ${selectedBlock.name} (${selectedBlock.clientId})`);
            } else if (insertionPoint) {
                // Use normal insertion point logic
                insertBlock(
                    newBlock,
                    insertionPoint.index,
                    insertionPoint.rootClientId
                );
                console.log(`✅ Successfully inserted ${blockType} at index ${insertionPoint.index} in container ${insertionPoint.rootClientId}`);
            } else {
                console.log('❌ No valid insertion point available');
            }
        } catch (error) {
            console.log(`❌ Native insertion failed for ${blockType}:`, error.message);
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
                            onClick={() => setShowSettings(true)}
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
            
            {/* Settings Modal */}
            <SettingsModal
                isVisible={showSettings}
                onClose={() => setShowSettings(false)}
                settings={editorSettings}
                onSettingsChange={setEditorSettings}
            />
        </div>
    );
};

export default EditorSidebar;