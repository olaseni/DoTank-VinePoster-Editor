import { createRoot } from '@wordpress/element';
import { 
    BlockEditorProvider, 
    BlockEditorKeyboardShortcuts, 
    WritingFlow, 
    ObserveTyping,
    BlockList,
    BlockTools
} from '@wordpress/block-editor';
import { 
    Popover, 
    SlotFillProvider, 
    DropZoneProvider 
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/block-library';
import '@wordpress/format-library';

const FrontendEditor = () => {
    const [blocks, setBlocks] = useState([]);
    const [title, setTitle] = useState('');
    const [isBlocksRegistered, setIsBlocksRegistered] = useState(false);

    // Register core blocks
    useEffect(() => {
        if (!isBlocksRegistered) {
            registerCoreBlocks();
            setIsBlocksRegistered(true);
        }
    }, [isBlocksRegistered]);

    // Initialize with default template
    useEffect(() => {
        if (isBlocksRegistered && blocks.length === 0) {
            const defaultTemplate = [
                createBlock('core/paragraph', {
                    placeholder: 'A short description'
                }),
                createBlock('core/columns', {}, [
                    createBlock('core/column', {}, [
                        createBlock('core/paragraph', {
                            placeholder: 'This content fits in a column 1'
                        })
                    ]),
                    createBlock('core/column', {}, [
                        createBlock('core/paragraph', {
                            placeholder: 'This content fits in a column 2'
                        })
                    ])
                ]),
                createBlock('core/image', {
                    placeholder: 'Featured Image'
                })
            ];
            setBlocks(defaultTemplate);
        }
    }, [isBlocksRegistered, blocks.length]);

    const onUpdateBlocks = (newBlocks) => {
        setBlocks(newBlocks);
    };

    // Don't render until blocks are registered
    if (!isBlocksRegistered) {
        return <div>Loading editor...</div>;
    }

    return (
        <SlotFillProvider>
            <DropZoneProvider>
                <div className="edit-post-layout__content">
                    <BlockEditorProvider
                        value={blocks}
                        onInput={onUpdateBlocks}
                        onChange={onUpdateBlocks}
                        settings={{
                            hasFixedToolbar: false,
                            focusMode: false,
                            hasReducedUI: false,
                        }}
                    >
                        <div className="edit-post-visual-editor">
                            <div className="edit-post-visual-editor__post-title-wrapper">
                                <div className="edit-post-visual-editor__post-title">
                                    <input
                                        type="text"
                                        className="editor-post-title__input"
                                        placeholder="Add title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="editor-styles-wrapper">
                                <div className="edit-post-visual-editor__content-area">
                                    <BlockEditorKeyboardShortcuts.Register />
                                    <BlockTools>
                                        <WritingFlow>
                                            <ObserveTyping>
                                                <BlockList className="edit-post-visual-editor__block-list" />
                                            </ObserveTyping>
                                        </WritingFlow>
                                    </BlockTools>
                                </div>
                            </div>
                        </div>
                        
                        <Popover.Slot />
                    </BlockEditorProvider>
                </div>
            </DropZoneProvider>
        </SlotFillProvider>
    );
};

// Initialize the frontend editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const editorContainer = document.getElementById('frontend-editor-app');
    if (editorContainer) {
        const root = createRoot(editorContainer);
        root.render(<FrontendEditor />);
    }
});