import { Modal, Button, ToggleControl, PanelBody, Panel, TabPanel, TextControl, SelectControl } from '@wordpress/components';
import { useState } from '@wordpress/element';

const SettingsModal = ({ isVisible, onClose, settings, onSettingsChange }) => {
    if (!isVisible) return null;

    const handleSettingChange = (key, value) => {
        if (onSettingsChange) {
            onSettingsChange({ ...settings, [key]: value });
        }
    };

    const handleAddAuthor = () => {
        const newAuthor = {
            name: '',
            bio: '',
            avatarUrl: '',
            email: '',
            website: ''
        };
        const currentAuthors = settings?.authors || [];
        handleSettingChange('authors', [...currentAuthors, newAuthor]);
    };

    const handleAuthorChange = (index, field, value) => {
        const currentAuthors = settings?.authors || [];
        const updatedAuthors = [...currentAuthors];
        updatedAuthors[index] = { ...updatedAuthors[index], [field]: value };
        handleSettingChange('authors', updatedAuthors);
    };

    const handleRemoveAuthor = (index) => {
        const currentAuthors = settings?.authors || [];
        const updatedAuthors = currentAuthors.filter((_, i) => i !== index);
        handleSettingChange('authors', updatedAuthors);
    };

    const tabs = [
        {
            name: 'authors',
            title: 'Authors',
            className: 'settings-tab-authors'
        },
        {
            name: 'display',
            title: 'Display Options',
            className: 'settings-tab-display'
        }
    ];

    const renderTabContent = (tab) => {
        switch (tab.name) {
            case 'authors':
                return (
                    <div className="settings-tab-content">
                        <div className="authors-section">
                            <div className="authors-header">
                                <h3>Authors</h3>
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => handleAddAuthor()}
                                >
                                    Add Author
                                </Button>
                            </div>
                            
                            <Panel className="authors-panel">
                                {(settings?.authors || []).map((author, index) => (
                                    <PanelBody
                                        key={index}
                                        title={author.name || `Author ${index + 1}`}
                                        initialOpen={index === 0}
                                        className="author-panel-body"
                                    >
                                        <div className="author-controls">
                                            <TextControl
                                                label="Name"
                                                value={author.name || ''}
                                                onChange={(value) => handleAuthorChange(index, 'name', value)}
                                            />
                                            <TextControl
                                                label="Bio"
                                                help="Short bio text for the author"
                                                value={author.bio || ''}
                                                onChange={(value) => handleAuthorChange(index, 'bio', value)}
                                            />
                                            <TextControl
                                                label="Avatar URL"
                                                help="URL for the author's profile picture"
                                                value={author.avatarUrl || ''}
                                                onChange={(value) => handleAuthorChange(index, 'avatarUrl', value)}
                                            />
                                            <TextControl
                                                label="Email"
                                                help="Author's email address"
                                                value={author.email || ''}
                                                onChange={(value) => handleAuthorChange(index, 'email', value)}
                                            />
                                            <TextControl
                                                label="Website"
                                                help="Author's website URL"
                                                value={author.website || ''}
                                                onChange={(value) => handleAuthorChange(index, 'website', value)}
                                            />
                                            
                                            <div className="author-actions">
                                                <Button
                                                    variant="link"
                                                    isDestructive
                                                    onClick={() => handleRemoveAuthor(index)}
                                                    disabled={(settings?.authors || []).length <= 1}
                                                >
                                                    Remove Author
                                                </Button>
                                            </div>
                                        </div>
                                    </PanelBody>
                                ))}
                                
                                {(!settings?.authors || settings.authors.length === 0) && (
                                    <div className="no-authors">
                                        <p>No authors added yet. Click "Add Author" to get started.</p>
                                    </div>
                                )}
                            </Panel>
                        </div>
                    </div>
                );
            case 'display':
                return (
                    <div className="settings-tab-content">
                        <ToggleControl
                            label="Show Featured Image"
                            help="Display the featured image section in the sidebar"
                            checked={settings?.showFeaturedImage || false}
                            onChange={(value) => handleSettingChange('showFeaturedImage', value)}
                        />
                        <ToggleControl
                            label="Show Tags"
                            help="Display the tags section in the sidebar"
                            checked={settings?.showTags || false}
                            onChange={(value) => handleSettingChange('showTags', value)}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Modal
            title="Editor Settings"
            onRequestClose={onClose}
            className="settings-modal"
            size="medium"
        >
            <div className="settings-modal-content">
                <TabPanel
                    className="settings-tab-panel"
                    activeClass="active-tab"
                    tabs={tabs}
                >
                    {renderTabContent}
                </TabPanel>
                
                <div className="settings-modal-footer">
                    <Button variant="primary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;