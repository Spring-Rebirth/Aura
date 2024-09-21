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


export default function SignUp() {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [onVerify, setOnVerify] = useState(false);
    const [verifyInfo, setVerifyInfo] = useState(null);
    const { setUser, setIsLoggedIn } = useGlobalContext();
    // const [clipboardContent, setClipboardContent] = useState('');

    const readClipboard = async () => {
        const content = await Clipboard.getStringAsync();
        return content;
    };

    const handleVerify = async () => {
        const clipboardContent = await readClipboard();

        const parts = clipboardContent.split('?')[1].split('&');
        const userId = parts[0].split('=')[1];
        console.log('userId:', userId);
        // 和创建Email api返回值进行比对
        if (userId === verifyInfo.userId) {
            Alert.alert('Verify Successful');
            setIsLoggedIn(true);
            router.replace('/home');
        } else {
            Alert.alert('Verification failed, please check if the verification link is correct');
        }

    }


    async function submit() {

        if (form.username === '' || form.email === '' || form.password === '' || form.confirmPassword === '') {
            Alert.alert('Error', 'Please fill in all the fields!');
            return;
        }

        setIsSubmitting(true);

        try {
            const { userDocument: newUser, Verification } = await registerUser(form.email, form.password, form.username);
            // TODO: add to global state
            setUser(newUser);
            setVerifyInfo(Verification);



            Alert.alert('Success', 'Verification email sent. Please Copy the link in the email and cone back.');
            setOnVerify(true);

        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }

    }

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