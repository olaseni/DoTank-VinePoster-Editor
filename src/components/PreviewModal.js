import { Button } from '@wordpress/components';

const PreviewModal = ({ isVisible, onClose, previewUrl, title = "Preview" }) => {
    if (!isVisible || !previewUrl) {
        return null;
    }

    return (
        <div
            className="post-preview-modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="post-preview-modal">
                <div className="post-preview-content">
                    <iframe
                        src={previewUrl}
                        frameBorder="0"
                        title={title}
                    />
                </div>
                <div className="post-preview-footer">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;