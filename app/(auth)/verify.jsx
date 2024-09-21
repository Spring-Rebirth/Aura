import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { account } from '../../lib/appwrite'; // 替换为你的 Appwrite 初始化文件
import * as Linking from 'expo-linking';

const Verify = () => {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const handleVerification = async () => {
            const url = await Linking.getInitialURL();
            if (url) {
                const { path, queryParams } = Linking.parse(url);
                console.log('深度链接触发:', path, queryParams);

                if (path === 'verify' && queryParams.userId && queryParams.secret) {
                    try {
                        const response = await account.updateVerification(queryParams.userId, queryParams.secret);
                        console.log('邮箱验证成功:', response);
                        Alert.alert('成功', '邮箱验证成功！', [
                            { text: '确定', onPress: () => router.replace('/profile') }
                        ]);
                    } catch (error) {
                        console.error('邮箱验证失败:', error);
                        Alert.alert('错误', '邮箱验证失败，请重试。');
                    } finally {
                        setLoading(false);
                    }
                } else {
                    Alert.alert('无效链接', '请确保您使用的是正确的验证链接。');
                    setLoading(false);
                }
            } else {
                Alert.alert('错误', '未能获取链接，请重试。');
                setLoading(false);
            }
        };

        handleVerification();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>正在验证邮箱...</Text>
            </View>
        );
    }

    return (
        <View>
            <Text>请稍等...</Text>
        </View>
    );
};

export default Verify;
