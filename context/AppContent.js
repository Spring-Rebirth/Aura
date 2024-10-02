// AppContent.js
import React, { useEffect, useRef, useContext } from 'react';
import { View, Alert, AppState } from 'react-native';
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
            // 保存数据到本地
            try {
                await AsyncStorage.setItem('playData', JSON.stringify(playDataRef.current));
            } catch (error) {
                console.error('保存播放数据失败:', error);
            }

            // 同步数据到后端
            await syncDataToBackend(playDataRef);
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
