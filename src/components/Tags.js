import { Button } from '@wordpress/components';

const Tags = () => {
    return (
        <div className="tags-container">
            <div className="tag-buttons">
                <Button 
                    variant="secondary" 
                    className="tag-button"
                    isSmall
                >
                    TAG 1
                </Button>
                <Button 
                    variant="secondary" 
                    className="tag-button"
                    isSmall
                >
                    TAG 2
                </Button>
            </div>
            <Button 
                variant="link" 
                className="add-tag-button"
                isSmall
            >
                + Add Tag
            </Button>
        </div>
    );
};

export default Tags;