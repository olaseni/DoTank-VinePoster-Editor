import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useEffect, useRef } from 'react';

const SelectionChangeWatcher = ({ onSelectionChange }) => {
    const selectedBlock = useSelect(
        (select) => select(blockEditorStore).getSelectedBlock(),
        []
    );

    const previousBlockId = useRef();

    useEffect(() => {
        const currentId = selectedBlock?.clientId;

        if (previousBlockId.current !== currentId) {
            previousBlockId.current = currentId;
            onSelectionChange?.(selectedBlock);
        }
    }, [selectedBlock]);

    return null;
};

SelectionChangeWatcher.defaultProps = {
    onSelectionChange: () => {},
};

export default SelectionChangeWatcher;