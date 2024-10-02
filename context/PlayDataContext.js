// PlayDataContext.js
import React, { createContext, useRef } from 'react';

export const PlayDataContext = createContext();

export const PlayDataProvider = ({ children }) => {
    const playDataRef = useRef({});

    const updatePlayData = (videoId, count) => {
        playDataRef.current[videoId] = { count, synced: false };
    };

    return (
        <PlayDataContext.Provider value={{ playDataRef, updatePlayData }}>
            {children}
        </PlayDataContext.Provider>
    );
};
