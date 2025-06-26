import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useEffect, useRef } from 'react';

const SelectionChangeWatcher = ({ onSelectionChange }) => {
    const selectedClientId = useSelect(
        (select) => select(blockEditorStore).getSelectedBlockClientId(),
        []
    );

    const previousClientId = useRef();

    useEffect(() => {
        if (previousClientId.current !== selectedClientId) {
            previousClientId.current = selectedClientId;
            onSelectionChange?.(selectedClientId);
        }
    }, [selectedClientId]);

    return null;
};

SelectionChangeWatcher.defaultProps = {
    onSelectionChange: () => {},
};

export default SelectionChangeWatcher;