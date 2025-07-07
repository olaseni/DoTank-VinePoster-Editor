import { useState } from '@wordpress/element';
import {
    BlockEditorProvider,
    BlockList,
    BlockTools,
    WritingFlow,
    ObserveTyping
} from '@wordpress/block-editor';
import EditorSidebar from './EditorSidebar';
import SelectionChangeWatcher from './SelectionChangeWatcher';
import { mediaUploadUtilityWithNonce } from '../utilities/mediaUploadUtility';
import { allowedBlockTypesInEditor } from '../constants/configuration';

const EditorContentArea = ({ 
    blocks, 
    onBlocksChange, 
    onPreviewClick, 
    postId 
}) => {
    const [currentSelectedBlock, setCurrentSelectedBlock] = useState(-1);

    // Function to insert a new block at the current position (column/group containers only)
    const handleInsertBlock = (newBlock) => {
        const currentSelectedBlockClientId = currentSelectedBlock?.clientId;

        if (currentSelectedBlockClientId) {
            // Only allow insertion in column and group containers
            const allowedContainerTypes = ['core/column', 'core/group'];
            const containerOfContainerTypes = ['core/columns'];

            // Search for the selected block and handle insertion
            const findAndInsertInContainer = (blocksArray) => {
                for (let i = 0; i < blocksArray.length; i++) {
                    const block = blocksArray[i];

                    // Check if the selected block IS this container of containers (e.g., columns)
                    if (block.clientId === currentSelectedBlockClientId &&
                        containerOfContainerTypes.includes(block.name) &&
                        block.innerBlocks && block.innerBlocks.length > 0) {

                        // Find the first sub-container (e.g., first column)
                        const firstSubContainer = block.innerBlocks[0];
                        if (firstSubContainer && allowedContainerTypes.includes(firstSubContainer.name)) {
                            // Insert at the end of the first sub-container
                            const updatedFirstSubContainer = {
                                ...firstSubContainer,
                                innerBlocks: [...firstSubContainer.innerBlocks, newBlock]
                            };

                            const updatedInnerBlocks = [...block.innerBlocks];
                            updatedInnerBlocks[0] = updatedFirstSubContainer;

                            const updatedBlock = {
                                ...block,
                                innerBlocks: updatedInnerBlocks
                            };

                            const updatedBlocks = [...blocksArray];
                            updatedBlocks[i] = updatedBlock;

                            return updatedBlocks;
                        }
                    }

                    // Check if selected block is in this container's inner blocks
                    if (block.innerBlocks && block.innerBlocks.length > 0 &&
                        allowedContainerTypes.includes(block.name)) {
                        const innerBlockIndex = block.innerBlocks.findIndex(
                            innerBlock => innerBlock.clientId === currentSelectedBlockClientId
                        );

                        if (innerBlockIndex !== -1) {
                            // Found the selected block in this container, insert after it
                            const updatedInnerBlocks = [...block.innerBlocks];
                            updatedInnerBlocks.splice(innerBlockIndex + 1, 0, newBlock);

                            // Update the parent block with new inner blocks
                            const updatedBlock = {
                                ...block,
                                innerBlocks: updatedInnerBlocks
                            };

                            // Update the main blocks array
                            const updatedBlocks = [...blocksArray];
                            updatedBlocks[i] = updatedBlock;

                            return updatedBlocks;
                        }
                    }

                    // Recursively search deeper nested blocks
                    if (block.innerBlocks && block.innerBlocks.length > 0) {
                        const nestedResult = findAndInsertInContainer(block.innerBlocks);
                        if (nestedResult) {
                            const updatedBlock = {
                                ...block,
                                innerBlocks: nestedResult
                            };
                            const updatedBlocks = [...blocksArray];
                            updatedBlocks[i] = updatedBlock;
                            return updatedBlocks;
                        }
                    }
                }
                return null;
            };

            const updatedBlocks = findAndInsertInContainer(blocks);
            if (updatedBlocks) {
                onBlocksChange(updatedBlocks);
                console.log(`Inserted ${newBlock.name} successfully`);
            } else {
                console.log(`No valid container found for selected block - block insertion skipped`);
            }
        } else {
            console.log(`No block selected - block insertion skipped`);
        }
    };

    return (
        <div className="frontend-editor-blocks editor-styles-wrapper is-editor-constrained">
            <BlockEditorProvider
                value={blocks}
                onInput={onBlocksChange}
                onChange={onBlocksChange}
                settings={{
                    alignWide: false,
                    disableCustomColors: true,
                    disableCustomFontSizes: true,
                    disablePostFormats: true,
                    hasFixedToolbar: false,
                    availableLegacyWidgets: {},
                    hasPermissionsToManageWidgets: false,
                    focusMode: false,
                    hasReducedUI: false,
                    canUserUseUnfilteredHTML: true,
                    canLockBlocks: false,
                    codeEditingEnabled: false,
                    richEditingEnabled: false,
                    __experimentalCanUserUseUnfilteredHTML: false,
                    __experimentalBlockPatterns: [],
                    __experimentalBlockPatternCategories: [],
                    mediaUpload: mediaUploadUtilityWithNonce(window?.frontendEditorData?.nonce),
                    allowedBlockTypes: allowedBlockTypesInEditor
                }}
            >
                <BlockTools>
                    <WritingFlow>
                        <ObserveTyping>
                            <BlockList />
                        </ObserveTyping>
                    </WritingFlow>
                </BlockTools>
                <SelectionChangeWatcher
                    onSelectionChange={setCurrentSelectedBlock}
                />
                <EditorSidebar
                    onInsertBlock={handleInsertBlock}
                    onPreviewClick={onPreviewClick}
                    postId={postId}
                    currentSelectedBlock={currentSelectedBlock}
                    blocks={blocks}
                />
            </BlockEditorProvider>
        </div>
    );
};

export default EditorContentArea;