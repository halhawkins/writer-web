// Likely in a hooks/useCurrentDocument.ts or within your API layer
import { useState, useEffect } from 'react';
import type { AppApi } from '@writer/plugin-api';

export const useCurrentDocument = (api: AppApi) => {
    // 1. Initialize state with whatever the API currently knows
    const [doc, setDoc] = useState(api.documents.getCurrent());

    useEffect(() => {
        // 2. Define the listener
        const handleDocChange = (updatedDoc: any) => {
            setDoc(updatedDoc);
        };

        // 3. Subscribe to your existing event emitter
        // Using the 'textChanged' or a 'documentSwitched' event
        api.events.on('documentChanged', handleDocChange);

        // 4. Cleanup on unmount
        return () => {
            // api.events.off('documentChanged', handleDocChange);
        };
    }, [api]);

    return doc;
};