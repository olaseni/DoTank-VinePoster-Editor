import '@wordpress/editor';
import { StrictMode, useState, useEffect } from '@wordpress/element';
import { parse, serialize } from '@wordpress/blocks';
import {
    Button,
    SlotFillProvider,
    Popover,
    Snackbar
} from '@wordpress/components';
import PreviewModal from './components/PreviewModal';
import EditorFooter from './components/EditorFooter';
import PostTitle from './components/PostTitle';
import EditorContentArea from './components/EditorContentArea';
import createInitialTemplate from './utilities/createInitialTemplate';

const FrontendEditor = () => {
    const [blocks, setBlocks] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [postId, setPostId] = useState(0);
    const [postTitle, setPostTitle] = useState('');
    const [notices, setNotices] = useState([]);
    const [showPostPreview, setShowPostPreview] = useState(false);
    const [publishedPostUrl, setPublishedPostUrl] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [initialContent, setInitialContent] = useState({ blocks: [], title: '' });
    const [postStatus, setPostStatus] = useState('draft');

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
            let previewUrl = `${window.frontendEditorData.previewUrl}&p=${postId}`;
            if (postStatus === 'draft') {
                previewUrl += '&preview=true';
            }
            setPublishedPostUrl(previewUrl);
            setShowPostPreview(true);
        }
    };

    // Check for content changes
    const checkForChanges = (currentBlocks, currentTitle) => {
        const currentContent = serialize(currentBlocks);
        const initialContentSerialized = serialize(initialContent.blocks);

        const hasChanges =
            currentContent !== initialContentSerialized ||
            currentTitle !== initialContent.title;

        setHasUnsavedChanges(hasChanges);
    };

    // Use default WordPress registry

    useEffect(() => {
        // Initialize with default values
        if (window.frontendEditorData?.postData && Object.keys(window.frontendEditorData.postData).length > 0) {
            const post = window.frontendEditorData.postData;
            setPostId(post.id || 0);
            setPostTitle(post.title || '');
            setPostStatus(post.status || 'draft');

            // Parse existing content into blocks
            if (post.content) {
                const parsedBlocks = parse(post.content);

                // Remove title block if it exists (we'll handle title separately now)
                const contentBlocks = parsedBlocks.filter(block =>
                    !(block.name === 'core/heading' && block.attributes?.level === 1)
                );

                setBlocks(contentBlocks);
                setInitialContent({ blocks: contentBlocks, title: post.title || '' });
            } else {
                // Start with template blocks for new posts
                const templateBlocks = createInitialTemplate();
                setBlocks(templateBlocks);
                setInitialContent({ blocks: templateBlocks, title: '' });
            }
        } else {
            // No post data - start with template blocks
            setPostId(0);
            setPostTitle('');
            const templateBlocks = createInitialTemplate();
            setBlocks(templateBlocks);
            setInitialContent({ blocks: templateBlocks, title: '' });
        }
    }, []);

    // Detect changes in blocks
    useEffect(() => {
        if (initialContent.blocks.length > 0) {
            checkForChanges(blocks, postTitle);
        }
    }, [blocks, postTitle, initialContent]);

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

                // Reset unsaved changes flag after successful save
                setHasUnsavedChanges(false);
                setInitialContent({ blocks: [...blocks], title: postTitle });

                if (status === 'publish' && result.data.post_url) {
                    setPostStatus('publish');
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
                    setPostStatus('draft');
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


    return (
        <SlotFillProvider>
            <div className="frontend-gutenberg-editor has-sidebar">

                <div className="frontend-editor-content">
                    {/* Dedicated Title Input */}
                    <PostTitle
                        title={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Title"
                    />

                    <EditorContentArea
                        blocks={blocks}
                        onBlocksChange={setBlocks}
                        onPreviewClick={handlePreviewClick}
                        postId={postId}
                    />
                </div>

                <EditorFooter
                    onSaveDraft={() => savePost('draft')}
                    onPublish={() => savePost('publish')}
                    isSaving={isSaving}
                    hasUnsavedChanges={hasUnsavedChanges}
                />

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
                <PreviewModal
                    isVisible={showPostPreview}
                    onClose={() => setShowPostPreview(false)}
                    previewUrl={publishedPostUrl}
                    title="Published Post Preview"
                />
            </div>
        </SlotFillProvider>
    );
};

export default FrontendEditor;