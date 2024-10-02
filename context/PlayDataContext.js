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

    useEffect(() => {

        const loadInitialData = async () => {
            try {
                const data = await getAllPosts();
                // 测试
                // console.log("allPosts data:", JSON.stringify(data, null, 4));
                // return;
                // 初始化 playDataRef 的值，将 $id 作为键，count 和 synced 设置为默认值
                const formattedData = data.reduce((acc, item) => {
                    acc[item.$id] = {
                        count: item.played_counts, // 如果 played_counts 为 null，默认设置为 0
                        synced: false, // 默认 synced 为 false
                    };
                    return acc;
                }, {});
                console.log('formattedData:', JSON.stringify(formattedData, null, 4));

                playDataRef.current = formattedData;
            } catch (error) {
                console.error('从数据库获取数据时出错:', error);
            }

        };

        loadInitialData();
    }, []); // 空依赖数组，意味着只在组件挂载时执行一次

    const updatePlayData = (videoId, count) => {
        playDataRef.current[videoId] = { count, synced: false };
    };

    return (
        <PlayDataContext.Provider value={{ playDataRef, updatePlayData }}>
            {children}
        </PlayDataContext.Provider>
    );
};
