import { View, Image, Text, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import images from '../../constants/images'
import CustomForm from '../../components/CustomForm'
import CustomButton from '../../components/CustomButton'
import { StatusBar } from 'expo-status-bar'
import { Link, router } from 'expo-router'
// cSpell:word appwrite username psemibold
import { registerUser } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'
import { databases } from '../../lib/appwrite'
import { useNavigation } from '@react-navigation/native';
import { config } from '../../lib/appwrite'
import { ID } from 'react-native-appwrite';

export default function SignUp() {
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const { setUser, setIsLoggedIn } = useGlobalContext();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function submit() {
        if (form.username === '' || form.email === '' || form.password === '' || form.confirmPassword === '') {
            Alert.alert('Error', 'Please fill in all the fields!');
            return;
        }
        if (form.password !== form.confirmPassword) {
            Alert.alert('Error', 'The password and confirm password do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 注册用户
            const { newAccount, avatarURL } = await registerUser(form.email, form.password, form.username);

            // 创建用户文档
            const userDocument = await databases.createDocument(
                config.databaseId,
                config.usersCollectionId,
                ID.unique(),
                {
                    accountId: newAccount.$id,
                    email: newAccount.email,
                    username: newAccount.name,
                    avatar: avatarURL,
                }
            );

            // 更新全局用户状态
            setUser(userDocument);
            setIsLoggedIn(true);

            // 确保所有状态更新完成后再进行页面跳转
            setTimeout(() => {
                router.replace('/home');
            }, 100); // 延迟 100 毫秒以确保状态同步完成

        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isSubmitting) {
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

                            <Text className='text-white text-2xl font-psemibold mt-6'>Sign up</Text>

                            <CustomForm title='User Name'
                                handleChangeText={(text) => setForm({ ...form, username: text })}
                                value={form.username}
                                placeholder={'Give your account a catchy name'}
                            />
                            <CustomForm title='Email'
                                handleChangeText={(text) => setForm({ ...form, email: text })}
                                value={form.email}
                                placeholder={'Enter your email address'}
                            />
                            <CustomForm title='Password'
                                handleChangeText={(text) => setForm({ ...form, password: text })}
                                value={form.password}
                                placeholder={'Enter your new password'}
                            />
                            <CustomForm title='Confirm Password'
                                handleChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                                value={form.confirmPassword}
                                placeholder={'Enter your password to confirm'}
                            />

                            <CustomButton
                                title='Sign Up'
                                style='h-16 mt-6 py-3'
                                textStyle={'text-lg text-[#161622]'}
                                onPress={submit}
                                isLoading={isSubmitting}
                            />

                        </View>
                    </View>
                </ScrollView>
                <StatusBar style='light' />
            </SafeAreaView>
        </>
    )
}