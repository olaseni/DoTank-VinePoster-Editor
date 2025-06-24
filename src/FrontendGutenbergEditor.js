import '@wordpress/editor';
import { StrictMode, useState, useEffect } from '@wordpress/element';
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

    // Create initial template based on prototype
    const createInitialTemplate = () => {
        return [
            // Description paragraph
            createBlock('core/paragraph', {
                content: '',
                placeholder: 'A Short Description',
                fontSize: 'medium'
            }),

            // Author section using group block
            createBlock('core/columns', {
                    columns: 2
                }, [
                    createBlock('core/column', {}, [
                        createBlock('core/image', {
                            url: '',
                            alt: 'Author Avatar',
                            width: 50,
                            height: 50,
                            sizeSlug: 'thumbnail'
                        })
                    ]),
                    createBlock('core/column', {}, [
                        createBlock('core/paragraph', {
                            content: '',
                            placeholder: 'Author Name'
                        })
                    ])
                ]),

            // Main content area with media and text
            createBlock('core/media-text', {
                mediaPosition: 'left',
                mediaType: 'image',
                url:'',
                mediaUrl:'',
                imageFill: false,
                focalPoint: { x: 0.5, y: 0.5 }
            }, [
                createBlock('core/paragraph', {
                    content: '',
                    placeholder: 'Some more content can come in here'
                }),
                createBlock('core/paragraph', {
                    content: '',
                    placeholder: 'Even more content goes in here'
                })
            ]),

            // Two-column layout at bottom
            createBlock('core/columns', {
                columns: 2
            }, [
                createBlock('core/column', {}, [
                    createBlock('core/paragraph', {
                        content: '',
                        placeholder: 'This content fits in a column'
                    })
                ]),
                createBlock('core/column', {}, [
                    createBlock('core/paragraph', {
                        content: '',
                        placeholder: 'This content fits in a column'
                    })
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

    const goHome = () => {
        window.location.href = window.frontendEditorData.homeUrl;
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