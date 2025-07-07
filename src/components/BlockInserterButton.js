const BlockInserterButton = ({ 
    blockType, 
    attributes = {}, 
    isAllowed, 
    onInsert, 
    title, 
    disabledTitle = "Not allowed in this context",
    className = "block-option",
    children 
}) => {
    const handleClick = () => {
        if (isAllowed && onInsert) {
            onInsert(blockType, attributes);
        }
    };

    return (
        <div 
            className={`${className} ${!isAllowed ? 'disabled' : ''}`}
            title={isAllowed ? title : disabledTitle}
            onClick={handleClick}
        >
            {children}
        </div>
    );
};

export default BlockInserterButton;