import { createBlock } from '@wordpress/blocks';
import { allowedBlockTypesInMainContentArea } from '../constants/configuration';

// Create initial template with locked/unlocked regions
const createInitialTemplate = () => {
    return [
        // FIXED: Author section structure (locked, but content editable)
        createBlock('core/group', {
            layout: { type: 'constrained' },
            className: 'template-author frontend-editor-section-group',
            lock: { move: true, remove: true },
            templateLock: 'insert'
        }, [
            createBlock('core/columns', {
                columns: 2,
                lock: { move: true, remove: true },
                allowedBlocks: ['core/column'],
                verticalAlignment: 'center'
            }, [
                createBlock('core/column', {
                    lock: { move: true, remove: true },
                    allowedBlocks: ['core/image'],
                    width: 'fit-content',
                    className: 'author-avatar-column'
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
                    allowedBlocks: ['core/paragraph'],
                    verticalAlignment: 'center'
                }, [
                    createBlock('core/paragraph', {
                        content: '',
                        placeholder: 'Author Name'
                    })
                ])
            ])
        ]),

        // EDITABLE: Description section
        createBlock('core/group', {
            layout: { type: 'constrained' },
            className: 'editable-description frontend-editor-section',
            lock: { move: true, remove: true },
            templateLock: false,
            allowedBlocks: ['core/paragraph', 'core/image'],
        }, [
            createBlock('core/paragraph', {
                placeholder: 'Short Introduction'
            })
        ]),

        // EDITABLE: Main content area (completely flexible)
        createBlock('core/group', {
            layout: { type: 'constrained' },
            className: 'editable-main-content frontend-editor-section',
            lock: { move: true, remove: true },
            templateLock: false,
            allowedBlocks: allowedBlockTypesInMainContentArea
        }, [
            createBlock('core/paragraph', {
                placeholder: 'Main content area'
            })
        ]),

        // FIXED: Footer columns (structure locked, content editable)
        createBlock('core/group', {
            layout: { type: 'constrained' },
            className: 'template-footer frontend-editor-section',
            lock: { move: false, remove: false },
            templateLock: 'insert'
        }, [
            createBlock('core/columns', {
                columns: 1,
                lock: { move: false, remove: false },
                allowedBlocks: ['core/column']
            }, [
                createBlock('core/column', {
                    lock: { move: false, remove: false },
                    allowedBlocks: ['core/paragraph', 'core/button', 'core/buttons'],
                }, [
                    createBlock('core/paragraph', {
                        content: '',
                        placeholder: 'Footer content'
                    })
                ])
            ])
        ])
    ];
};

export default createInitialTemplate;