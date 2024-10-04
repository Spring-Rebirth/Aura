import React, { useEffect, useRef, useContext } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayDataContext } from '../context/PlayDataContext';
import { syncDataToBackend } from '../lib/appwrite';
import { Stack } from "expo-router";

const AppContent = () => {
    const appState = useRef(AppState.currentState);
    const { playDataRef } = useContext(PlayDataContext);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // 加载本地存储的数据
        const loadPlayData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('playData');
                if (storedData) {
                    playDataRef.current = JSON.parse(storedData);
                }
            } catch (error) {
                console.error('加载播放数据失败:', error);
            }
        };

        loadPlayData();

        // 在应用启动时同步数据
        syncDataToBackend(playDataRef)
            .catch(error => console.error('初始同步失败:', error));

        // 定期同步数据
        const interval = setInterval(() => {
            syncDataToBackend(playDataRef)
                .then(() => console.log('定期同步成功'))
                .catch(error => console.error('定期同步失败:', error));
        }, 5 * 60 * 1000); // 5 分钟

        return () => {
            subscription.remove();
            clearInterval(interval);
        };
    }, []);

    const handleAppStateChange = async (nextAppState) => {
        if (
            appState.current.match(/active/) &&
            (nextAppState === 'background' || nextAppState === 'inactive')
        ) {
            // 优先同步数据到后端
            try {
                await syncDataToBackend(playDataRef);
                console.log('应用退出前同步成功');
            } catch (error) {
                console.error('同步到后端失败:', error);
            }

            // 异步保存数据到本地
            AsyncStorage.setItem('playData', JSON.stringify(playDataRef.current))
                .catch(error => {
                    console.error('保存播放数据失败:', error);
                });
        }

        appState.current = nextAppState;
    };

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
            <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
        </Stack>
    );
};

export default AppContent;
import { parse } from 'expo-linking';
