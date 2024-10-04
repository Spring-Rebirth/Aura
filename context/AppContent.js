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
    }, []);

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
