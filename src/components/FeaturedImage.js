import { Button } from '@wordpress/components';

const FeaturedImage = () => {
    return (
        <div className="featured-image-container">
            <div className="featured-image-placeholder">
                <div className="image-placeholder-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M19 7v10H5V7h14m0-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-5 6l-3 3.72L9 13l-3 4h12l-4-5z"/>
                    </svg>
                </div>
            </div>
            <Button 
                variant="secondary" 
                className="featured-image-button"
                isSmall
            >
                Set Featured Image
            </Button>
        </div>
    );
};

export default FeaturedImage;