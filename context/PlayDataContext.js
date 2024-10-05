// PlayDataContext.js
import React, { createContext, useRef } from 'react';
import { syncDataToBackend } from '../lib/appwrite'; // 导入同步函数

export const PlayDataContext = createContext();

export const PlayDataProvider = ({ children }) => {
    const playDataRef = useRef({});

    const updatePlayData = async (videoId, count) => {
        playDataRef.current[videoId] = {
            count,
            lastPlayTime: Date.now(),
            synced: false,
        };
        // 立即同步数据到后端
        try {
            await syncDataToBackend(playDataRef);
            console.log('播放数据同步成功');
        } catch (error) {
            console.error('同步播放数据失败:', error);
        }
    };

    return (
        <PlayDataContext.Provider value={{ playDataRef, updatePlayData }}>
            {children}
        </PlayDataContext.Provider>
    );
};
