import { View, Image, Text, ScrollView, Alert } from 'react-native'
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

export default function SignUp() {
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });

    const navigation = useNavigation();
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
            const { newAccount, avatarURL } = await registerUser(form.email, form.password, form.username);

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

            setUser(userDocument);
            setIsLoggedIn(true);
            router.replace('/home');

        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }

    }

    useEffect(() => {
        // 监听页面卸载（用户离开页面）
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            // deleteTempUser(tempUserId); // 清除未完成的用户
            Alert.alert(`请注册后再登录`);
        });

        return unsubscribe; // 清除监听器
    }, [navigation]);

    return (
        <>
            <SafeAreaView className='bg-primary'>
                <ScrollView contentContainerStyle={{ height: '100%' }}>
                    <View className='h-full justify-center px-6'>
                        <View className='h-[85vh] justify-center'>

                            <Image
                                source={images.logo}
                                className='w-[160] h-auto '
                                resizeMode='contain'
                            />

                            <Text className='text-white text-2xl font-psemibold mt-6'>Sign up</Text>

                            <CustomForm title='User Name'
                                handleChangeText={(text) => setForm({ ...form, username: text })}
                                value={form.username}
                            />
                            <CustomForm title='Email'
                                handleChangeText={(text) => setForm({ ...form, email: text })}
                                value={form.email}
                            />
                            <CustomForm title='Password'
                                handleChangeText={(text) => setForm({ ...form, password: text })}
                                value={form.password}
                            />
                            <CustomForm title='Confirm Password'
                                handleChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                                value={form.confirmPassword}
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