import 'react-native-url-polyfill/auto';
import React, { useEffect, useState, useContext } from 'react';
import { SplashScreen } from "expo-router";
import { useFonts } from 'expo-font';
import { GlobalProvider } from '../context/GlobalProvider';

import * as Updates from 'expo-updates';
import { Alert, AppState } from 'react-native';
import { PlayDataProvider, PlayDataContext } from '../context/PlayDataContext';
import { Stack } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parse } from 'expo-linking';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded, error] = useFonts({
        "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
        "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
        "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
        "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
        "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
        "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
        "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
        "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    });

    const [isUpdating, setIsUpdating] = useState(false);
    const [canNavigate, setCanNavigate] = useState(false);
    const [playDataLoaded, setPlayDataLoaded] = useState(false);

    useEffect(() => {
        if (error) throw error;

        async function checkForUpdates() {
            try {
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                    setIsUpdating(true);
                    await Updates.fetchUpdateAsync();

                    Alert.alert(
                        '有可用的更新',
                        '已经下载了新的更新，是否立即重启应用？',
                        [
                            {
                                text: '稍后',
                                onPress: () => {
                                    setIsUpdating(false);
                                    setCanNavigate(true);
                                },
                                style: 'cancel',
                            },
                            {
                                text: '立即重启',
                                onPress: async () => {
                                    await Updates.reloadAsync();
                                },
                            },
                        ],
                        { cancelable: false }
                    );
                } else {
                    setCanNavigate(true);
                }
            } catch (e) {
                setCanNavigate(true);
            } finally {
                SplashScreen.hideAsync();
            }
        }

        if (fontsLoaded) {
            checkForUpdates();
        }
    }, [fontsLoaded, error]);

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
            } finally {
                setPlayDataLoaded(true);
            }
        };

        loadPlayData();
    }, []);

    if (!fontsLoaded || isUpdating || !canNavigate || !playDataLoaded) {
        return null;
    }

    return (
        <GlobalProvider>
            <PlayDataProvider>
                <Navigation />
            </PlayDataProvider>
        </GlobalProvider>
    );
}
const Navigation = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
            <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
        </Stack>
    );
}
