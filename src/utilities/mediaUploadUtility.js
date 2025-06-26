import { uploadMedia } from '@wordpress/media-utils';

// WordPress expects MIME types in this format for client-side validation
const wpAllowedMimeTypes = {
    'jpg|jpeg|jpe': 'image/jpeg',
    'gif': 'image/gif',
    'png': 'image/png',
    'webp': 'image/webp'
};

const mediaUploadUtility = ({ filesList, onFileChange, allowedTypes, onError, nonce }) => {
    console.log('Media upload called with:', { filesList, allowedTypes });

    // Handle allowedTypes being undefined by using image types
    const types = allowedTypes || ['image'];
    console.log('Using allowedTypes:', types);

    uploadMedia({
        filesList,
        onFileChange: (media) => {
            console.log('Upload successful:', media);
            if (Array.isArray(media)) {
                onFileChange(media);
            } else {
                onFileChange([media]);
            }
        },
        allowedTypes: types,
        onError: (error) => {
            console.error('Upload error:', error);
            if (onError) {
                onError(error);
            } else {
                alert('Upload failed: ' + (error.message || error));
            }
        },
        wpAllowedMimeTypes,
        additionalData: {
            _wpnonce: nonce ?? null
        }
    });
};

const mediaUploadUtilityWithNonce = (nonce) => (parameters) => {
    return mediaUploadUtility({ ...parameters, nonce });
};

export { mediaUploadUtility, mediaUploadUtilityWithNonce };
