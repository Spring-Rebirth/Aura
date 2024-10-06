import { View, Image, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import { getCurrentUser, signIn } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import images from '../../constants/images';
import CustomForm from '../../components/CustomForm';
import CustomButton from '../../components/CustomButton';

export default function SignIn() {
    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false); // 新增状态控制页面跳转

    const { user, setUser, setIsLoggedIn } = useGlobalContext();

    async function submit() {
        if (form.email === '' || form.password === '') {
            Alert.alert('Error', 'Please fill in all the fields!');
            return;
        }

        setIsSubmitting(true);

        try {
            await signIn(form.email, form.password);

            // 获取当前用户信息并更新状态
            const result = await getCurrentUser();
            if (result && user !== result) {
                setUser(result);
            }
            setIsLoggedIn(true);

            // 确保所有状态都已更新后再跳转页面
            setIsSubmitting(false);
            setIsTransitioning(true); // 标记进入跳转状态

            setTimeout(() => {
                router.replace('/home');
            }, 100); // 延迟 100 毫秒以确保状态同步完成

        } catch (error) {
            Alert.alert('Error in submit', error.message);
            setIsSubmitting(false);
        }
    }

    if (isSubmitting || isTransitioning) {
        return (
            <View className="flex-1 justify-center items-center bg-primary">
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <>
            <SafeAreaView className='bg-primary'>
                <ScrollView contentContainerStyle={{ height: '100%' }}>
                    <View className='h-full justify-center px-6'>
                        <View className='h-[85vh] justify-center'>
                            <View className='flex-row items-center space-x-2'>
                                <Image
                                    source={images.logoSmall}
                                    resizeMode='contain'
                                    className='w-9 h-10'
                                />
                                <Text className='text-white text-4xl font-semibold'>Aura</Text>
                            </View>

                            <Text className='text-white text-2xl font-psemibold mt-6'>Sign in</Text>

                            <CustomForm title='Email'
                                handleChangeText={(text) => setForm({ ...form, email: text })}
                                value={form.email}
                                placeholder={'Enter your email address'}
                            />
                            <CustomForm title='Password'
                                handleChangeText={(text) => setForm({ ...form, password: text })}
                                value={form.password}
                                placeholder={'Enter your password'}
                            />

                            <CustomButton
                                title='Sign In'
                                style='h-16 mt-6 py-3'
                                textStyle={'text-lg text-[#161622]'}
                                onPress={submit}
                                isLoading={isSubmitting}
                            />
                            <View className='items-center mt-6'>
                                <Text className='text-gray-100'>
                                    Don't have an account?&nbsp;&nbsp;
                                    <Link
                                        href='/sign-up'
                                        className='text-secondary'>Sign up
                                    </Link>
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <StatusBar style='light' />
            </SafeAreaView>
        </>
    )
}
