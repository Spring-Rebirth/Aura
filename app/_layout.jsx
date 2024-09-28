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

    useEffect(() => {
        // 处理字体加载错误
        if (error) throw error;

        async function checkForUpdates() {
            try {
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                    // 有更新可用
                    await Updates.fetchUpdateAsync();
                    // 通知用户，重新启动应用以应用更新
                    Alert.alert(
                        '有可用的更新',
                        '已经下载了新的更新，是否立即重启应用？',
                        [
                            {
                                text: '稍后',
                                onPress: () => {
                                    setIsUpdating(false);
                                    SplashScreen.hideAsync(); // 隐藏启动屏幕，显示应用内容
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
                    // 没有更新，隐藏启动屏幕
                    SplashScreen.hideAsync();
                }
            } catch (e) {
                console.log(e);
                // 检查更新失败，隐藏启动屏幕
                SplashScreen.hideAsync();
            }
        }

        if (fontsLoaded) {
            // 字体加载完成后，进行更新检查
            checkForUpdates();
        }

    }, [fontsLoaded, error]);

    if (!fontsLoaded || isUpdating) {
        // 在字体未加载完成或正在更新时，保持启动屏幕
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
