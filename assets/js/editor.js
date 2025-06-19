import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel, PluginPostStatusInfo } from '@wordpress/editor';
import { PanelBody, SelectControl, Button, TextControl } from '@wordpress/components';
import { useEffect } from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';

const HideElements = ({ targetStyle }) => {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
             ${targetStyle} {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style); // Clean up on unmount
        };
    }, []);
    return null;
};

const PluginPostStatusInfoTest = () => (
    <PluginPostStatusInfo>
        <p>Post Status Info SlotFill</p>
    </PluginPostStatusInfo>
);

// registerPlugin('post-status-info-test', { render: PluginPostStatusInfoTest });

['.editor-post-panel__section.editor-post-summary', '.editor-document-tools__inserter-toggle'].forEach((targetStyle, index) => {
    registerPlugin(`hidden-control-${index}`, { render: () => <HideElements targetStyle={targetStyle} /> });
});

const ContentSettingsPanel = () => {
    const [authorModal, setAuthorModal] = useState(false);

    const { meta } = useSelect(select => ({
        meta: select('core/editor').getEditedPostAttribute('meta') || {},
    }));

    const { editPost } = useDispatch('core/editor');

    const updateMeta = (key, value) => {
        editPost({ meta: { [key]: value } });
    };

    return (
        <PluginDocumentSettingPanel
            name="content-settings"
            title="Content Settings"
            className="content-manager-panel"
        >
            <PanelBody title="Content Type" initialOpen={true}>
                <SelectControl
                    value={meta.content_type || 'article'}
                    options={[
                        { label: 'Article', value: 'article' },
                        { label: 'Video', value: 'video' },
                    ]}
                    onChange={(value) => updateMeta('content_type', value)}
                />
            </PanelBody>

            <PanelBody title="Authors" initialOpen={true}>
                <div className="authors-section">
                    <Button
                        variant="secondary"
                        onClick={() => setAuthorModal(true)}
                    >
                        Manage Authors
                    </Button>
                    <div className="authors-list">
                        {(meta.content_authors || []).map((author, index) => (
                            <div key={index} className="author-item">
                                {author.name} - {author.title}
                            </div>
                        ))}
                    </div>
                </div>
            </PanelBody>

            <PanelBody title="Target Audience" initialOpen={true}>
                <SelectControl
                    value={meta.target_audience || 'group1'}
                    options={[
                        { label: 'Group 1', value: 'group1' },
                        { label: 'Group 2', value: 'group2' },
                        { label: 'Group 3', value: 'group3' },
                        { label: 'Group 4', value: 'group4' },
                    ]}
                    onChange={(value) => updateMeta('target_audience', value)}
                />
            </PanelBody>

            <PanelBody title="Reading Time">
                <div>Estimated: {meta.estimated_read_time || 10} mins read</div>
            </PanelBody>

            {authorModal && <AuthorModal onClose={() => setAuthorModal(false)} />}
        </PluginDocumentSettingPanel>
    );
};

const AuthorModal = ({ onClose }) => {
    // Author management modal component
    return (
        <div className="author-modal">
            {/* Modal content */}
        </div>
    );
};

registerPlugin('content-manager', {
    render: ContentSettingsPanel,
});