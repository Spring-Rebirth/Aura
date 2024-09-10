import { View, Image, Text, ScrollView, Alert } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import images from '../../constants/images'
import CustomForm from '../../components/CustomForm'
import CustomButton from '../../components/CustomButton'
import { StatusBar } from 'expo-status-bar'
import { Link, router } from 'expo-router'
// cSpell:word appwrite username psemibold
import { registerUser } from '../../lib/appwrite'

export default function SignUp() {
    const [form, setForm] = React.useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    async function submit() {

        if (form.username === '' || form.email === '' || form.password === '' || form.confirmPassword === '') {
            Alert.alert('Error', 'Please fill in all the fields!');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await registerUser(form.email, form.password, form.username);
            // TODO: add to global state

            router.replace('/home');
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

                            <CustomForm title='User Name'
                                handleChangeText={(text) => setForm({ ...form, username: text })}
                            />
                            <CustomForm title='Email'
                                handleChangeText={(text) => setForm({ ...form, email: text })}
                            />
                            <CustomForm title='Password'
                                handleChangeText={(text) => setForm({ ...form, password: text })}
                            />
                            <CustomForm title='Confirm Password'
                                handleChangeText={(text) => setForm({ ...form, confirmPassword: text })}
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
                        </View>
                    </View>
                </ScrollView>
                <StatusBar style='light' />
            </SafeAreaView>
        </>
    )
}