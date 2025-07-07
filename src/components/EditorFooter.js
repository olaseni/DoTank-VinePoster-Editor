import { Button } from '@wordpress/components';

const EditorFooter = ({ 
    onSaveDraft, 
    onPublish, 
    isSaving, 
    hasUnsavedChanges 
}) => {
    return (
        <div className="frontend-editor-footer">
            <Button
                variant="secondary"
                onClick={onSaveDraft}
                isBusy={isSaving}
                disabled={isSaving || !hasUnsavedChanges}
                className="save-draft-btn"
            >
                Save Draft
            </Button>
            <Button
                variant="primary"
                onClick={onPublish}
                isBusy={isSaving}
                disabled={isSaving || !hasUnsavedChanges}
                className="publish-btn"
            >
                Publish
            </Button>
        </div>
    );
};

export default EditorFooter;