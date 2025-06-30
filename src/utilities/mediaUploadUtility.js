import { uploadMedia } from '@wordpress/media-utils';

const mimeTypeToExtension = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
};

// Convert to extension(s) → MIME
const allowedMimeTypes = Object.entries(mimeTypeToExtension).reduce((acc, [mime, ext]) => {
    let exts;
    if (mime === 'image/jpeg') {
        exts = 'jpg|jpeg|jpe'; // Common JPEG extensions
    } else {
        exts = ext;
    }
    acc[exts] = mime;
    return acc;
}, {});

const mediaUploadUtility = ({ filesList, onFileChange, allowedTypes, onError, nonce }) => {
    console.log('Media upload called with:', { filesList, allowedTypes });

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
        onError: (error) => {
            console.error('Upload error:', error);
            if (onError) {
                onError(error);
            } else {
                alert('Upload failed: ' + (error.message || error));
            }
        },
        additionalData: {
            _wpnonce: nonce ?? null
        }
    });
};

const mediaUploadUtilityWithNonce = (nonce) => (parameters) => {
    return mediaUploadUtility({ ...parameters, nonce });
};

export { mediaUploadUtility, mediaUploadUtilityWithNonce, mimeTypeToExtension };
