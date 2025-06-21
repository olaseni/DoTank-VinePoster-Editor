import { useState, useEffect } from '@wordpress/element';
import { parse, serialize, createBlock } from '@wordpress/blocks';
import { 
    BlockEditorProvider, 
    BlockList,
    BlockTools,
    WritingFlow,
    ObserveTyping
} from '@wordpress/block-editor';
import { 
    Button, 
    TextControl, 
    TextareaControl,
    SlotFillProvider,
    DropZoneProvider,
    Popover
} from '@wordpress/components';

const FrontendGutenbergEditor = () => {
    const [blocks, setBlocks] = useState([]);
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [postId, setPostId] = useState(0);

    // Use default WordPress registry

    useEffect(() => {
        // Initialize with default values
        if (window.frontendEditorData?.postData && Object.keys(window.frontendEditorData.postData).length > 0) {
            const post = window.frontendEditorData.postData;
            setTitle(post.title || '');
            setExcerpt(post.excerpt || '');
            setPostId(post.id || 0);
            
            // Parse existing content into blocks
            if (post.content) {
                setBlocks(parse(post.content));
            } else {
                // Start with a paragraph block using createBlock
                setBlocks([
                    createBlock('core/paragraph', {
                        placeholder: 'Start writing your content here...'
                    })
                ]);
            }
        } else {
            // No post data - initialize with default empty post
            setTitle('');
            setExcerpt('');
            setPostId(0);
            setBlocks([
                createBlock('core/paragraph', {
                    placeholder: 'Start writing your content here...'
                })
            ]);
        }
    }, []);

    const savePost = async (status = 'draft') => {
        setIsSaving(true);
        
        const content = serialize(blocks);
        const action = status === 'publish' ? 'publish_post_content' : 'save_post_content';
        
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
            
            const result = await response.json();
            
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
            alert('Network error occurred');
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const goHome = () => {
        window.location.href = window.frontendEditorData.homeUrl;
    };

    return (
        <SlotFillProvider>
            <DropZoneProvider>
                <div className="frontend-gutenberg-editor">
            
                    <div className="frontend-editor-content">
                        <div className="frontend-editor-main">
                            <div className="frontend-editor-title-section">
                                <TextControl
                                    placeholder="Enter title here"
                                    value={title}
                                    onChange={setTitle}
                                    className="frontend-editor-title"
                                />
                                <TextareaControl
                                    placeholder="Write an excerpt (optional)"
                                    value={excerpt}
                                    onChange={setExcerpt}
                                    className="frontend-editor-description"
                                    rows={2}
                                />
                            </div>

                            <div className="frontend-editor-blocks">
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
                                        mediaUpload: true,
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
                </div>
            </DropZoneProvider>
        </SlotFillProvider>
    );
};

export default FrontendGutenbergEditor;