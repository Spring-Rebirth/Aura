import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from "../constants";
import CustomButton from '../components/CustomButton';
import { Redirect, router } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';
// cSpell:word pregular appwrite
//cSpell:ignore Aora pregular
export default function Welcome() {

    const { isLoading, isLoggedIn } = useGlobalContext();
    if (isLoggedIn) {
        return <Redirect href='/home' />;
    }


    return (

        <SafeAreaView className="bg-primary h-full">

            <StatusBar style="light" backgroundColor='#161622' />
            <ScrollView contentContainerStyle={{ height: '100%' }}>
                <View className='justify-center items-center min-h-[85vh] px-4'>
                    <Image
                        source={images.logo}
                        resizeMode='contain'
                        className='w-[130] h-[84]'
                    />
                    <Image
                        source={images.cards}
                        resizeMode='contain'
                        className='w-[380] h-[300]'
                    />
                    <View className='relative mt-5'>
                        <Text className='text-white text-3xl font-bold text-center'>
                            Discover Endless{'\n'}
                            Possibilities with{' '}
                            <Text className='text-secondary-200'>Aora</Text>
                        </Text>
                        <Image
                            source={images.path}
                            className='w-[136] h-[15] absolute -bottom-2 -right-8'
                            resizeMode='contain'
                        />
                    </View>
                    <Text className='text-gray-100 text-center mt-6 font-pregular text-sm'>
                        Where Creativity Meets Innovation: Embark on a Journey of Limitless
                        Exploration with Aora
                    </Text>

                    {isLoading ? (
                        <View className="w-full h-20 justify-center items-center bg-primary mt-6">
                            <ActivityIndicator size="large" color="#ffffff" />
                            <Text className='mt-[10] text-white text-xl'>Identifying login status</Text>
                        </View>
                    ) : (
                        <CustomButton
                            onPress={() => { router.push('/sign-in') }}
                            style={'w-full mt-6 py-3'}
                            title={'Login to continue'}
                            textStyle={'text-lg text-[#161622]'}
                        />
                    )}



                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

