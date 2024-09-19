import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import useGetData from '../../hooks/useGetData'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGlobalContext } from '../../context/GlobalProvider'
import EmptyState from '../../components/EmptyState'
import CustomButton from '../../components/CustomButton'
import VideoCard from '../../components/VideoCard'
import { icons } from '../../constants'
import { signOut } from '../../lib/appwrite'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function profile() {
    const [userPostsData, setUserPostsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { fetchUserPosts } = useGetData({ setLoading, setUserPostsData });
    const { user, setUser, setIsLoggedIn } = useGlobalContext();


    useEffect(() => {
        setLoading(true);
        fetchUserPosts(user.$id)
        setLoading(false);
    }, [user.$id])

    const handleSignOut = () => {
        signOut();
        setUser(null);
        setIsLoggedIn(false);
        router.replace('/sign-in');
    }

    return (
        <SafeAreaView className='bg-primary h-full'>

            <FlatList
                data={loading ? [] : userPostsData}
                // item 是 data 数组中的每一项
                keyExtractor={(item) => item.$id}

                ListHeaderComponent={() => {
                    return (
                        <View className='my-6 px-4 relative'>
                            <TouchableOpacity onPress={handleSignOut}>
                                <Image
                                    source={icons.logout}
                                    className='w-6 h-6 absolute top-2 right-4'
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>

                            <View className='justify-between items-center mt-10'>
                                <View className='w-[56px] h-[56px] border-2 border-secondary rounded-lg overflow-hidden'>
                                    <Image
                                        source={{ uri: user?.avatar }}
                                        className='w-full h-full'
                                        resizeMode='cover'
                                    />
                                </View>
                                <Text className='text-white text-xl font-psemibold mt-2.5 '>{user?.username}</Text>
                            </View>
                            <View className='flex-row space-x-14 mt-4 justify-center'>
                                <View className='items-center'>
                                    <Text className='text-white font-psemibold text-xl'>1</Text>
                                    <Text className='text-gray-100 text-sm'>Posts</Text>
                                </View>
                                <View className='items-center'>
                                    <Text className='text-white font-psemibold text-xl'>2</Text>
                                    <Text className='text-gray-100 text-sm'>Views</Text>
                                </View>

                            </View>
                        </View>
                    );
                }}
                // renderItem 接受一个对象参数，通常解构为 { item, index, separators }
                renderItem={({ item }) => {
                    return (
                        <VideoCard video={item} />
                    )
                }}
                ListEmptyComponent={() => {
                    return loading ? (
                        <View className="flex-1 justify-center items-center bg-primary">
                            <ActivityIndicator size="large" color="#ffffff" />
                            <Text className='mt-[10] text-white text-xl'>Loading, please wait...</Text>
                        </View>
                    ) : (
                        <View>
                            <EmptyState />
                            <CustomButton
                                title={'Create Video'}
                                textStyle={'text-black'}
                                style={'h-16 my-5 mx-4'}
                            />
                        </View>
                    );
                }}

            />
            <StatusBar style='light' />
        </SafeAreaView>
    )
}

