import 'react-native-url-polyfill/auto' // from App-write documentation
import { useEffect } from 'react'
import { Stack, SplashScreen } from "expo-router";
import { useFonts } from 'expo-font';
import { GlobalProvider } from '../context/GlobalProvider'
import * as Linking from 'expo-linking';
import { account } from '../lib/appwrite'

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

    useEffect(() => {
        // 处理错误
        if (error) throw error;

        // 字体加载完成后隐藏启动屏幕
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }

        // 处理深度链接
        const handleDeepLink = async (event) => {
            if (event.url) {
                const { path, queryParams } = Linking.parse(event.url);
                console.log('深度链接触发:', path, queryParams);

                // 验证路径和参数的逻辑
                if (path === 'verify' && queryParams.userId && queryParams.secret) {
                    try {
                        const response = await account.updateVerification(queryParams.userId, queryParams.secret);
                        console.log('Verification successful:', response);
                        router.replace('/profile');  // 验证成功后跳转到用户个人资料页面
                    } catch (error) {
                        console.error('Verification failed:', error);
                        // 验证失败的处理
                    }
                }
            } else {
                console.log('没有深度链接URL');
            }
        };

        // 添加深度链接事件监听器
        const subscription = Linking.addEventListener('url', handleDeepLink);

        // 检查应用启动时是否通过深度链接启动
        const checkLoginStatus = async () => {
            try {
                const user = await account.get(); // 检查用户登录状态
                if (user) {
                    console.log('User is logged in');
                    // 用户已登录，不处理深度链接
                } else {
                    console.log('用户未登录，处理深度链接');
                    Linking.getInitialURL().then((url) => {
                        if (url) {
                            handleDeepLink({ url });
                        }
                    });
                }
            } catch (error) {
                console.error('Error checking login status:', error);
            }
        };

        checkLoginStatus();
        // 在组件卸载时移除监听器
        return () => {
            subscription.remove();
        };
    }, [fontsLoaded, error]);

    if (!fontsLoaded && !error) {
        return null;
    }

    return (
        <GlobalProvider>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
                <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </GlobalProvider>
    )
}

