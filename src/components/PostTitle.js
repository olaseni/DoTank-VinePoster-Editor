const PostTitle = ({ 
    title, 
    onChange, 
    placeholder = "Title" 
}) => {
    const handleInput = (e) => {
        // Auto-resize functionality
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
        <div className="post-title-section">
            <textarea
                className="post-title-input"
                placeholder={placeholder}
                value={title}
                onChange={onChange}
                rows={1}
                onInput={handleInput}
            />
        </div>
    );
};

export default PostTitle;