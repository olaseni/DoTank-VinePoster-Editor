import { useState, useEffect } from '@wordpress/element';
import { parse, serialize, createBlock } from '@wordpress/blocks';
import { 
    BlockEditorProvider, 
    BlockList,
    BlockTools,
    WritingFlow,
    ObserveTyping,
    MediaUpload,
    useBlockProps,
    store as blockEditorStore
} from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';
import { 
    Button, 
    SlotFillProvider,
    DropZoneProvider,
    Popover
} from '@wordpress/components';
import { uploadMedia } from '@wordpress/media-utils';
import EditorSidebar from './components/EditorSidebar';

const FrontendGutenbergEditor = () => {
    const [blocks, setBlocks] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [postId, setPostId] = useState(0);
    const [postTitle, setPostTitle] = useState('');
    
    // Track current insertion index (where new blocks should be inserted)
    const [currentInsertionIndex, setCurrentInsertionIndex] = useState(-1);

    // Hide floating toolbars and options popovers specifically for template blocks only
    useEffect(() => {

        // Hide floating toolbars and options popovers specifically for the first two template blocks only
        const hideFloatingToolbars = () => {
            const toolbarPopovers = document.querySelectorAll('.components-popover.block-editor-block-toolbar__popover');
            const settingsPopovers = document.querySelectorAll('.components-popover.block-editor-block-settings-menu__popover');
            const blockPopovers = document.querySelectorAll('.components-popover.block-editor-block-popover');
            const optionsPopovers = document.querySelectorAll('.components-popover[data-floating-ui-portal]');
            const allPopovers = document.querySelectorAll('.components-popover');
            const templateBlocks = document.querySelectorAll('.block-editor-block-list__block:first-child');
            
            templateBlocks.forEach(block => {
                // Hide options buttons within template blocks
                const optionsButtons = block.querySelectorAll([
                    '.block-editor-block-settings-menu__trigger',
                    '.block-editor-block-settings-menu__toggle',
                    'button[aria-label*="Options"]',
                    'button[aria-label*="More options"]',
                    'button[aria-label*="Block options"]',
                    'button[aria-expanded]'
                ].join(', '));
                
                optionsButtons.forEach(button => {
                    button.style.display = 'none';
                    button.disabled = true;
                });
                
                if (block.classList.contains('is-selected')) {
                    // Hide toolbar popovers
                    toolbarPopovers.forEach(popover => {
                        popover.style.display = 'none';
                    });
                    
                    // Hide settings/options popovers
                    settingsPopovers.forEach(popover => {
                        popover.style.display = 'none';
                    });
                    
                    // Hide block popovers
                    blockPopovers.forEach(popover => {
                        popover.style.display = 'none';
                    });
                    
                    // Hide any floating popovers
                    optionsPopovers.forEach(popover => {
                        popover.style.display = 'none';
                    });
                    
                    // Hide all popovers when template blocks are selected
                    allPopovers.forEach(popover => {
                        if (popover.classList.contains('block-editor-block-toolbar__popover') ||
                            popover.classList.contains('block-editor-block-settings-menu__popover') ||
                            popover.classList.contains('block-editor-block-popover')) {
                            popover.style.display = 'none';
                        }
                    });
                }
            });
        };

        // Monitor for floating toolbar appearances
        const observer = new MutationObserver(() => {
            hideFloatingToolbars();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also hide on selection changes
        document.addEventListener('selectionchange', hideFloatingToolbars);
        document.addEventListener('click', hideFloatingToolbars);

        // Cleanup
        return () => {
            observer.disconnect();
            document.removeEventListener('selectionchange', hideFloatingToolbars);
            document.removeEventListener('click', hideFloatingToolbars);
        };
    }, []);

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
                
                // Ensure first block (description) has proper lock attributes
                if (contentBlocks.length >= 1 && contentBlocks[0].name === 'core/paragraph') {
                    contentBlocks[0].attributes = {
                        ...contentBlocks[0].attributes,
                        lock: { move: true, remove: true }
                    };
                }
                
                // If no content blocks, create initial template
                if (contentBlocks.length === 0) {
                    setBlocks([
                        createBlock('core/paragraph', {
                            placeholder: 'Add short description ...',
                            lock: { move: true, remove: true },
                            isTemplateBlock: true
                        })
                    ]);
                } else {
                    setBlocks(contentBlocks);
                }
            } else {
                // Create initial template block for new posts
                setBlocks([
                    createBlock('core/paragraph', {
                        placeholder: 'Add short description ...',
                        lock: { move: true, remove: true },
                        isTemplateBlock: true
                    })
                ]);
            }
        } else {
            // No post data - create initial template
            setPostId(0);
            setPostTitle('');
            setBlocks([
                createBlock('core/paragraph', {
                    placeholder: 'Add short description ...',
                    lock: { move: true, remove: true },
                    isTemplateBlock: true
                })
            ]);
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
                alert(result.data.message);
                if (result.data.post_id && postId === 0) {
                    setPostId(result.data.post_id);
                }
                if (status === 'publish' && result.data.post_url) {
                    window.open(result.data.post_url, '_blank');
                }
            } else {
                alert(result.data.message || 'An error occurred');
            }
        } catch (error) {
            alert('Network error occurred: ' + error.message);
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const goHome = () => {
        window.location.href = window.frontendEditorData.homeUrl;
    };

    // Function to insert a new block at the current position
    const handleInsertBlock = (newBlock, insertIndex = -1) => {
        const updatedBlocks = [...blocks];
        // Ensure we don't insert before the locked template block (first 1)
        const minIndex = 1;
        const index = insertIndex >= 0 ? Math.max(insertIndex, minIndex) : blocks.length;
        updatedBlocks.splice(index, 0, newBlock);
        setBlocks(updatedBlocks);
        
        // Set insertion index to after the newly inserted block
        setCurrentInsertionIndex(index + 1);
        
        console.log(`Inserted ${newBlock.name} at index ${index}`);
    };

    // Track block selection to update insertion point
    const handleBlockSelection = (clientId) => {
        if (clientId) {
            const blockIndex = blocks.findIndex(block => block.clientId === clientId);
            setCurrentInsertionIndex(blockIndex + 1);
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
                                    placeholder="Add title..."
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
                                    onChange={(newBlocks) => {
                                        setBlocks(newBlocks);
                                        // Update insertion index when blocks change
                                        setCurrentInsertionIndex(newBlocks.length);
                                    }}
                                    settings={{
                                        hasFixedToolbar: false,
                                        focusMode: false,
                                        hasReducedUI: false,
                                        canUserUseUnfilteredHTML: true,
                                        __experimentalCanUserUseUnfilteredHTML: true,
                                        template: [
                                            ['core/paragraph', { 
                                                placeholder: 'Add short description ...',
                                                lock: { move: true, remove: true }
                                            }]
                                        ],
                                        templateLock: 'insert',
                                        mediaUpload: ({ filesList, onFileChange, allowedTypes, onError }) => {
                                            console.log('Media upload called with:', { filesList, allowedTypes });
                                            console.log('Frontend editor data:', window.frontendEditorData);
                                            
                                            // Handle allowedTypes being undefined by using image types
                                            const types = allowedTypes || ['image'];
                                            console.log('Using allowedTypes:', types);
                                            
                                            // WordPress expects MIME types in this format for client-side validation
                                            const wpMimeTypes = {
                                                'jpg|jpeg|jpe': 'image/jpeg',
                                                'gif': 'image/gif', 
                                                'png': 'image/png',
                                                'webp': 'image/webp'
                                            };
                                            
                                            uploadMedia({
                                                filesList,
                                                onFileChange: (media) => {
                                                    console.log('Upload successful:', media);
                                                    if (Array.isArray(media)) {
                                                        onFileChange(media);
                                                    } else {
                                                        onFileChange([media]);
                                                    }
                                                },
                                                allowedTypes: types,
                                                onError: (error) => {
                                                    console.error('Upload error:', error);
                                                    if (onError) {
                                                        onError(error);
                                                    } else {
                                                        alert('Upload failed: ' + (error.message || error));
                                                    }
                                                },
                                                wpAllowedMimeTypes: wpMimeTypes,
                                                additionalData: {
                                                    _wpnonce: window.frontendEditorData?.nonce
                                                }
                                            });
                                        },
                                        allowedMimeTypes: {
                                            'image/jpeg': 'jpg',
                                            'image/png': 'png',
                                            'image/gif': 'gif',
                                            'image/webp': 'webp'
                                        }
                                    }}
                                >
                                    <BlockTools>
                                        <WritingFlow>
                                            <ObserveTyping>
                                                <BlockList />
                                            </ObserveTyping>
                                        </WritingFlow>
                                    </BlockTools>
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
                    
                    <EditorSidebar 
                        onInsertBlock={handleInsertBlock}
                        currentIndex={currentInsertionIndex}
                    />
                    
                    <Popover.Slot />
                </div>
            </DropZoneProvider>
        </SlotFillProvider>
    );
};

export default FrontendGutenbergEditor;