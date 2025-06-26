import { createBlock } from '@wordpress/blocks';

// Create initial template with locked/unlocked regions
const createInitialTemplate = () => {
    return [
        // EDITABLE: Description section
        createBlock('core/group', {
            className: 'editable-description',
            lock: { move: true, remove: true },
            templateLock: false,
            allowedBlocks: ['core/paragraph', 'core/image']
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
                lock: { move: true, remove: true },
                allowedBlocks: ['core/column']
            }, [
                createBlock('core/column', {
                    lock: { move: true, remove: true },
                    allowedBlocks: ['core/image']
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
                    lock: { move: true, remove: true },
                    allowedBlocks: ['core/paragraph']
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
            templateLock: false,
            allowedBlocks: ['core/paragraph', 'core/image', 'core/video', 'core/button', 'core/columns', 'core/group']
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
                lock: { move: true, remove: true },
                allowedBlocks: ['core/column']
            }, [
                createBlock('core/column', {
                    lock: { move: true, remove: true },
                    allowedBlocks: ['core/paragraph', 'core/button']
                }, [
                    createBlock('core/paragraph', {
                        content: '',
                        placeholder: 'Footer content column 1'
                    })
                ]),
                createBlock('core/column', {
                    lock: { move: true, remove: true },
                    allowedBlocks: ['core/paragraph', 'core/button']
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

export default createInitialTemplate;