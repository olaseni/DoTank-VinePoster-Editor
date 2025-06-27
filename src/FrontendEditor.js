import '@wordpress/editor';
import { StrictMode, useState, useEffect } from '@wordpress/element';
import { parse, serialize } from '@wordpress/blocks';
import {
    BlockEditorProvider,
    BlockList,
    BlockTools,
    WritingFlow,
    ObserveTyping,
    store as blockEditorStore
} from '@wordpress/block-editor';
import { select, dispatch, useSelect } from '@wordpress/data';
import {
    Button,
    SlotFillProvider,
    DropZoneProvider,
    Popover,
    Snackbar
} from '@wordpress/components';
import EditorSidebar from './components/EditorSidebar';
import SelectionChangeWatcher from './components/SelectionChangeWatcher';
import { mediaUploadUtilityWithNonce, mimeTypeToExtension } from './utilities/mediaUploadUtility';
import createInitialTemplate from './utilities/createInitialTemplate';

const FrontendEditor = () => {
    const [blocks, setBlocks] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [postId, setPostId] = useState(0);
    const [postTitle, setPostTitle] = useState('');
    const [notices, setNotices] = useState([]);
    const [showPostPreview, setShowPostPreview] = useState(false);
    const [publishedPostUrl, setPublishedPostUrl] = useState('');

    // Track current selected block index
    const [currentSelectedBlock, setCurrentSelectedBlock] = useState(-1);

    // Notice management
    const addNotice = (message, type = 'success', actions = []) => {
        const id = Date.now();
        setNotices(prev => [...prev, { id, message, type, actions }]);
        // Auto-dismiss after 6 seconds
        setTimeout(() => {
            removeNotice(id);
        }, 6000);
    };

    const removeNotice = (id) => {
        setNotices(prev => prev.filter(notice => notice.id !== id));
    };

    // Preview handler for sidebar button
    const handlePreviewClick = () => {
        if (postId) {
            // Create the published post URL for preview
            const previewUrl = `${window.frontendEditorData.homeUrl}?p=${postId}`;
            setPublishedPostUrl(previewUrl);
            setShowPostPreview(true);
        }
    };

    // Use default WordPress registry

    useEffect(() => {
        // Initialize with default values
        if (window.frontendEditorData?.postData && Object.keys(window.frontendEditorData.postData).length > 0) {
            const post = window.frontendEditorData.postData;
            setPostId(post.id || 0);
            setPostTitle(post.title || '');

            // Parse existing content into blocks
            if (post.content) {
                const parsedBlocks = parse(post.content);

                // Remove title block if it exists (we'll handle title separately now)
                const contentBlocks = parsedBlocks.filter(block =>
                    !(block.name === 'core/heading' && block.attributes?.level === 1)
                );

                setBlocks(contentBlocks);
            } else {
                // Start with template blocks for new posts
                setBlocks(createInitialTemplate());
            }
        } else {
            // No post data - start with template blocks
            setPostId(0);
            setPostTitle('');
            setBlocks(createInitialTemplate());
        }
    }, []);

    const savePost = async (status = 'draft') => {
        setIsSaving(true);

        const content = serialize(blocks);
        const action = status === 'publish' ? 'publish_post_content' : 'save_post_content';

        // Use the dedicated title state
        const title = postTitle.trim() || 'Untitled Post';

        // Extract excerpt from the first paragraph block
        const excerptBlock = blocks.find(block => block.name === 'core/paragraph' && block.attributes?.content);
        const excerpt = excerptBlock?.attributes?.content ?
            excerptBlock.attributes.content.substring(0, 150) + '...' : '';

        console.log('Saving post:', { action, postId, title, content: content.substring(0, 100) + '...', excerpt });
        console.log('Using nonce:', window.frontendEditorData.nonce);
        console.log('AJAX URL:', window.frontendEditorData.ajaxUrl);

        try {
            const response = await fetch(window.frontendEditorData.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action,
                    post_id: postId,
                    title,
                    content,
                    excerpt,
                    nonce: window.frontendEditorData.nonce,
                }),
            });

            console.log('Response status:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseText = await response.text();
            console.log('Raw response:', responseText);

            const result = JSON.parse(responseText);
            console.log('Parsed result:', result);

            if (result.success) {
                if (result.data.post_id && postId === 0) {
                    setPostId(result.data.post_id);
                }
                
                if (status === 'publish' && result.data.post_url) {
                    setPublishedPostUrl(result.data.post_url);
                    addNotice('Post published successfully!', 'success', [
                        {
                            label: 'View Post',
                            onClick: () => {
                                setShowPostPreview(true);
                            }
                        }
                    ]);
                } else {
                    addNotice('Draft saved successfully.', 'success');
                }
            } else {
                addNotice(result.data.message || 'An error occurred', 'error');
            }
        } catch (error) {
            addNotice('Network error occurred: ' + error.message, 'error');
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

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
                setBlocks(updatedBlocks);
                console.log(`Inserted ${newBlock.name} successfully`);
            } else {
                console.log(`No valid container found for selected block - block insertion skipped`);
            }
        } else {
            console.log(`No block selected - block insertion skipped`);
        }
    };

    return (
        <SlotFillProvider>
            <DropZoneProvider>
                <div className="frontend-gutenberg-editor has-sidebar">

                    <div className="frontend-editor-content">
                        <div className="frontend-editor-blocks">
                            {/* Dedicated Title Input */}
                            <div className="post-title-section">
                                <textarea
                                    className="post-title-input"
                                    placeholder="Title"
                                    value={postTitle}
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    rows={1}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />
                            </div>

                            <BlockEditorProvider
                                value={blocks}
                                onInput={setBlocks}
                                onChange={setBlocks}
                                settings={{
                                    hasFixedToolbar: false,
                                    focusMode: false,
                                    hasReducedUI: false,
                                    canUserUseUnfilteredHTML: true,
                                    __experimentalCanUserUseUnfilteredHTML: true,
                                    mediaUpload: mediaUploadUtilityWithNonce(window?.frontendEditorData?.nonce),
                                    allowedMimeTypes: mimeTypeToExtension,
                                    allowedBlockTypes: [
                                        'core/video',
                                        'core/image', 
                                        'core/columns',
                                        'core/column',
                                        'core/group',
                                        'core/paragraph',
                                        'core/button'
                                    ]
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
                                    onPreviewClick={handlePreviewClick}
                                    postId={postId}
                                />
                            </BlockEditorProvider>
                        </div>
                    </div>

                    <div className="frontend-editor-footer">
                        <Button
                            variant="secondary"
                            onClick={() => savePost('draft')}
                            isBusy={isSaving}
                            disabled={isSaving}
                            className="save-draft-btn"
                        >
                            Save Draft
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => savePost('publish')}
                            isBusy={isSaving}
                            disabled={isSaving}
                            className="publish-btn"
                        >
                            Publish
                        </Button>
                    </div>

                    <Popover.Slot />
                    
                    {/* Notice System */}
                    <div className="editor-notices">
                        {notices.map((notice) => (
                            <Snackbar
                                key={notice.id}
                                className={`editor-notice editor-notice--${notice.type}`}
                                onRemove={() => removeNotice(notice.id)}
                                actions={notice.actions}
                            >
                                {notice.message}
                            </Snackbar>
                        ))}
                    </div>

                    {/* Post Preview Modal */}
                    {showPostPreview && publishedPostUrl && (
                        <div 
                            className="post-preview-modal-overlay"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setShowPostPreview(false);
                                }
                            }}
                        >
                            <div className="post-preview-modal">
                                <div className="post-preview-content">
                                    <iframe
                                        src={`${publishedPostUrl}${publishedPostUrl.includes('?') ? '&' : '?'}show_admin_bar=false`}
                                        frameBorder="0"
                                        title="Published Post Preview"
                                    />
                                </div>
                                <div className="post-preview-footer">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowPostPreview(false)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DropZoneProvider>
        </SlotFillProvider>
    );
};

export default FrontendEditor;