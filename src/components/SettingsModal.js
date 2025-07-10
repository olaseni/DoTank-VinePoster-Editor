import { Modal, Button, ToggleControl, PanelBody, Panel } from '@wordpress/components';

const SettingsModal = ({ isVisible, onClose, settings, onSettingsChange }) => {
    if (!isVisible) return null;

    const handleSettingChange = (key, value) => {
        if (onSettingsChange) {
            onSettingsChange({ ...settings, [key]: value });
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
                <Panel>
                    <PanelBody title="Display Options" initialOpen={true}>
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
                    </PanelBody>
                    

                </Panel>
                
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