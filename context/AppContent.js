// AppContent.js
import React, { useEffect, useRef, useContext } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayDataContext } from '../context/PlayDataContext'; // 确保路径正确
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
        syncDataToBackend(playDataRef);

        return () => {
            subscription.remove();
        };
    }, []);

    const handleAppStateChange = async (nextAppState) => {
        if (
            appState.current.match(/active/) &&
            (nextAppState === 'background' || nextAppState === 'inactive')
        ) {
            // 并行执行保存和同步操作
            try {
                await Promise.all([
                    AsyncStorage.setItem('playData', JSON.stringify(playDataRef.current)),
                    syncDataToBackend(playDataRef)
                ]);
            } catch (error) {
                console.error('保存播放数据失败:', error);
            }
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
