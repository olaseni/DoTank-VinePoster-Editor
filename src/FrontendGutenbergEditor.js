import '@wordpress/editor';
import { StrictMode, useState, useEffect } from '@wordpress/element';
import { parse, serialize, createBlock } from '@wordpress/blocks';
import {
    BlockEditorProvider,
    BlockList,
    BlockTools,
    WritingFlow,
    ObserveTyping,
    store as blockEditorStore
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import {
    Button,
    SlotFillProvider,
    DropZoneProvider,
    Popover
} from '@wordpress/components';
import EditorSidebar from './components/EditorSidebar';
import SelectionChangeWatcher from './components/SelectionChangeWatcher';
import { mediaUploadUtilityWithNonce } from './utilities/mediaUploadUtility';

const FrontendGutenbergEditor = () => {
    const [blocks, setBlocks] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [postId, setPostId] = useState(0);
    const [postTitle, setPostTitle] = useState('');

    // Track current insertion index (where new blocks should be inserted)
    const [currentInsertionIndex, setCurrentInsertionIndex] = useState(-1);

    // Create initial template with locked/unlocked regions
    const createInitialTemplate = () => {
        return [
            // EDITABLE: Description section
            createBlock('core/group', {
                className: 'editable-description',
                lock: { move: true, remove: true },
                templateLock: false
            }, [
                createBlock('core/paragraph', {
                    content: '',
                    placeholder: 'Write your description here...',
                    fontSize: 'medium'
                })
            ]),

            // FIXED: Author section structure (locked, but content editable)
            createBlock('core/group', {
                className: 'template-author',
                lock: { move: true, remove: true },
                templateLock: 'insert'
            }, [
                createBlock('core/columns', {
                    columns: 2,
                    lock: { move: true, remove: true }
                }, [
                    createBlock('core/column', {
                        lock: { move: true, remove: true }
                    }, [
                        createBlock('core/image', {
                            url: '',
                            alt: 'Author Avatar',
                            width: 50,
                            height: 50,
                            sizeSlug: 'thumbnail'
                        })
                    ]),
                    createBlock('core/column', {
                        lock: { move: true, remove: true }
                    }, [
                        createBlock('core/paragraph', {
                            content: '',
                            placeholder: 'Author Name'
                        })
                    ])
                ])
            ]),

            // EDITABLE: Main content area (completely flexible)
            createBlock('core/group', {
                className: 'editable-main-content',
                lock: { move: true, remove: true },
                templateLock: false
            }, [
                createBlock('core/paragraph', {
                    content: '',
                    placeholder: 'Add your main content here. You can add any blocks in this section.'
                })
            ]),

            // FIXED: Footer columns (structure locked, content editable)
            createBlock('core/group', {
                className: 'template-footer',
                lock: { move: true, remove: true },
                templateLock: 'insert'
            }, [
                createBlock('core/columns', {
                    columns: 2,
                    lock: { move: true, remove: true }
                }, [
                    createBlock('core/column', {
                        lock: { move: true, remove: true }
                    }, [
                        createBlock('core/paragraph', {
                            content: '',
                            placeholder: 'Footer content column 1'
                        })
                    ]),
                    createBlock('core/column', {
                        lock: { move: true, remove: true }
                    }, [
                        createBlock('core/paragraph', {
                            content: '',
                            placeholder: 'Footer content column 2'
                        })
                    ])
                ])
            ])
        ];
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

    // Function to insert a new block at the current position
    const handleInsertBlock = (newBlock, insertIndex = -1) => {
        const updatedBlocks = [...blocks];
        const index = insertIndex >= 0 ? insertIndex : blocks.length;
        updatedBlocks.splice(index, 0, newBlock);
        setBlocks(updatedBlocks);

        // Set insertion index to after the newly inserted block
        setCurrentInsertionIndex(index + 1);

        console.log(`Inserted ${newBlock.name} at index ${index}`);
        console.log(selectedBlockClientId);
    };

    // Track block selection to update insertion point
    const handleBlockSelection = (clientId) => {
        if (clientId) {
            const blockIndex = blocks.findIndex(block => block.clientId === clientId);
            setCurrentInsertionIndex(blockIndex + 1);
        }
    };

    const selectedBlockClientId = useSelect(
        (select) => select(blockEditorStore).getSelectedBlockClientId(),
        [blocks]
    );

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
                                    mediaUpload: mediaUploadUtilityWithNonce(window?.frontendEditorData?.nonce),
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
                                <SelectionChangeWatcher
                                    onSelectionChange={(clientId) => {
                                        console.log('Selected block changed:', clientId);
                                    }}
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