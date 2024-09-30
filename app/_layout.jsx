import 'react-native-url-polyfill/auto';
import { useEffect, useState } from 'react';
import { Stack, SplashScreen } from "expo-router";
import { useFonts } from 'expo-font';
import { GlobalProvider } from '../context/GlobalProvider';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

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
    const [canNavigate, setCanNavigate] = useState(false);  // 新增状态变量

    useEffect(() => {
        if (error) throw error;

        async function checkForUpdates() {
            try {
                console.log('Checking for updates...');
                const update = await Updates.checkForUpdateAsync();
                console.log('Update available:', update.isAvailable);

                if (update.isAvailable) {
                    console.log('Fetching update...');
                    setIsUpdating(true);  // 设置更新状态为 true
                    await Updates.fetchUpdateAsync();
                    console.log('Update fetched.');

                    // 在更新下载完成后，提示用户
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
                                    console.log('Reloading app...');
                                    await Updates.reloadAsync();
                                },
                            },
                        ],
                        { cancelable: false }
                    );
                } else {
                    console.log('No updates available.');
                    setCanNavigate(true);
                }
            } catch (e) {
                console.log('Error checking for updates:', e);
                setCanNavigate(true);
            } finally {
                // 无论如何都要在更新检查完成后隐藏启动屏幕
                SplashScreen.hideAsync();
            }
        }

        if (fontsLoaded) {
            checkForUpdates();
        }
    }, [fontsLoaded, error]);

    if (!fontsLoaded || isUpdating || !canNavigate) {
        return null;
    }
    return (
        <GlobalProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
                <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
            </Stack>
        </GlobalProvider>
    );
}
