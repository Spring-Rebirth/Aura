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
import * as Clipboard from 'expo-clipboard';
import { databases } from '../../lib/appwrite'
import { useNavigation } from '@react-navigation/native';
import { deleteUserIfNotCompleted } from '../../lib/appwrite'

export default function SignUp() {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const navigation = useNavigation();
    const { setUser, setIsLoggedIn } = useGlobalContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [onVerify, setOnVerify] = useState(false);
    const [verifyInfo, setVerifyInfo] = useState(null);
    const [newUser, setNewUser] = useState(null);
    const [tempUserId, setTempUserId] = useState(null);


    const handleVerify = async () => {
        try {
            // 读取剪贴板内容
            const clipboardContent = await Clipboard.getStringAsync();

            // 检查剪贴板是否为空
            if (!clipboardContent) {
                Alert.alert('Empty content was read, please check the clipboard');
                return;
            }

            // 检查内容是否包含 '?' 并解析参数
            const queryString = clipboardContent.split('?')[1];
            if (!queryString) {
                Alert.alert('Invalid content format', 'The clipboard content is missing query parameters.');
                return;
            }

            // 提取 userId
            const userId = queryString.split('&')[0].split('=')[1];
            if (!userId) {
                Alert.alert('Invalid content format', 'The clipboard content does not contain a valid userId.');
                return;
            }

            // 验证 userId 是否匹配
            if (userId === verifyInfo.userId) {
                Alert.alert('Verify Successful');

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

                setNewUser(userDocument);
                console.log('用户文档已创建:', userDocument);

                setIsLoggedIn(true);
                router.replace('/home');
            } else {
                Alert.alert('Verification Failed', 'The userId does not match.');
            }

        } catch (error) {
            // 捕获异常
            Alert.alert('Error', 'Failed to read clipboard content. Please try again.');
        }
    };


    async function submit() {

        if (form.username === '' || form.email === '' || form.password === '' || form.confirmPassword === '') {
            Alert.alert('Error', 'Please fill in all the fields!');
            return;
        }

        setIsSubmitting(true);

        try {
            const { Verification } = await registerUser(form.email, form.password, form.username, setTempUserId);
            // TODO 待修改

            setVerifyInfo(Verification);
            setUser(newUser);


            Alert.alert('Success', 'Verification email sent. Please Copy the link in the email and cone back.');
            setOnVerify(true);

        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }

    }

    useEffect(() => {
        // 监听页面卸载（用户离开页面）
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            deleteUserIfNotCompleted(tempUserId); // 清除未完成的用户
        });

        return unsubscribe; // 清除监听器
    }, [navigation, tempUserId]);


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

                            {onVerify ? (
                                <>
                                    <Text className='text-white text-2xl font-psemibold mt-6'>
                                        Already copied the verification link?
                                    </Text>
                                    <Text className='text-white text-2xl font-psemibold mt-6'>
                                        Click the button to verify
                                    </Text>

                                    <CustomButton
                                        title='Verify'
                                        style='h-16 mt-6 py-3'
                                        textStyle={'text-lg text-[#161622]'}
                                        onPress={() => { handleVerify() }}
                                        isLoading={isSubmitting}
                                    />
                                </>
                            ) : (
                                <>
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
                                    <View className='items-center mt-6'>
                                        <Text className='text-gray-100'>
                                            Already have an account?&nbsp;&nbsp;
                                            <Link
                                                href='/sign-in'
                                                className='text-secondary'>Login
                                            </Link>
                                        </Text>
                                    </View>
                                </>
                            )}

                        </View>
                    </View>
                </ScrollView>
                <StatusBar style='light' />
            </SafeAreaView>
        </>
    )
}