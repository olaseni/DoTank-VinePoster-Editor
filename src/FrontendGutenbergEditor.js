import { useState, useEffect } from '@wordpress/element';
import { parse, serialize, createBlock } from '@wordpress/blocks';
import { 
    BlockEditorProvider, 
    BlockList,
    BlockTools,
    WritingFlow,
    ObserveTyping,
    MediaUpload
} from '@wordpress/block-editor';
import { 
    Button, 
    TextControl, 
    TextareaControl,
    SlotFillProvider,
    DropZoneProvider,
    Popover
} from '@wordpress/components';
import { uploadMedia } from '@wordpress/media-utils';
import EditorSidebar from './components/EditorSidebar';

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

    return (
        <SlotFillProvider>
            <DropZoneProvider>
                <div className="frontend-gutenberg-editor has-sidebar">
            
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
                    
                    <EditorSidebar />
                    
                    <Popover.Slot />
                </div>
            </DropZoneProvider>
        </SlotFillProvider>
    );
};

export default FrontendGutenbergEditor;