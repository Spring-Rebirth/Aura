// PlayDataContext.js
import React, { createContext, useRef, useEffect } from 'react';
import { getAllPosts } from '../lib/appwrite';

export const PlayDataContext = createContext();

export const PlayDataProvider = ({ children }) => {
    /*
        调用 updatePlayData 后，playDataRef.current 将如下所示：
        {
            abc123: { count: 7, synced: false },
            def456: { count: 3, synced: false },
        }

    */
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
