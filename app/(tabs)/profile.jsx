import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native'
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
import * as ImagePicker from 'expo-image-picker';
import { fetchFileUrl, updateAvatar, getCurrentUser } from '../../lib/appwrite'
import { createFile } from '../../lib/appwrite';

export default function profile() {
    const [userPostsData, setUserPostsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { fetchUserPosts } = useGetData({ setLoading, setUserPostsData });
    const { user, setUser, setIsLoggedIn } = useGlobalContext();
    const [refreshing, setRefreshing] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [currentPlayingPost, setCurrentPlayingPost] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);


    useEffect(() => {
        setLoading(true);
        fetchUserPosts(user.$id)
        setLoading(false);
    }, [user.$id, user.avatar])

    const handleSignOut = async () => {
        try {
            setIsTransitioning(true); // 设置跳转状态，防止渲染未准备好的页面

            // 异步调用 signOut 并等待完成
            await signOut();

            // 页面跳转到登录页面
            router.replace('/sign-in');

            // 更新状态
            setUser(null);
            setIsLoggedIn(false);
        } catch (error) {
            console.error('Sign out failed:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
            setIsTransitioning(false); // 如果出错，重置跳转状态
        }
    };


    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchUserPosts(user.$id);
        await getCurrentUser()
            .then(res => setUser(res))
            .catch(error => {
                console.error('getCurrentUser() failed:', error);
            })
        setRefreshing(false);
    }

    const handleAvatarPress = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted) {
            const pickerResult = await ImagePicker.launchImageLibraryAsync();
            console.log("pickerResult:", pickerResult);
            if (!pickerResult.canceled) {
                setAvatarUploading(true);
                // 数据参数模型转换           
                const { fileName, mimeType, fileSize, uri } = pickerResult.assets[0];
                const fileModel = { name: fileName, type: mimeType, size: fileSize, uri: uri }
                console.log('fileModel:', fileModel);
                try {
                    let file;
                    await createFile(fileModel)
                        .then(res => { file = res; })
                        .catch(err => {
                            console.warn('还没读取到创建的文件:', err);
                            Alert.alert('Network error, please try again.');
                            return;
                        })

                    if (file) {
                        const { response, fileId } = file;

                        console.log('createFile response:', response, fileId);

                        const StorageAvatarUrl = await fetchFileUrl(fileId);

                        console.log(`StorageAvatarUrl: ${StorageAvatarUrl}`);
                        const result = await updateAvatar(StorageAvatarUrl, user.$id);
                        console.log('updateAvatar result:', result);
                        setUser(result);
                        if (result) {
                            Alert.alert('Avatar uploaded successfully');
                        }
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setAvatarUploading(false);
                }

            }
        }
    };

    if (isTransitioning) {
        return (
            <View className="flex-1 justify-center items-center bg-primary">
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <SafeAreaView className='bg-primary h-full'>

            <FlatList
                data={loading ? [] : userPostsData}
                // item 是 data 数组中的每一项
                keyExtractor={(item) => item.$id}

                ListHeaderComponent={() => {
                    return (
                        <View className='my-6 px-4 mb-8 relative'>
                            <TouchableOpacity onPress={handleSignOut}>
                                <Image
                                    source={icons.logout}
                                    className='w-6 h-6 absolute top-2 right-4'
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>

                            <View className='justify-between items-center mt-10'>
                                <TouchableOpacity onPress={handleAvatarPress}>
                                    <View
                                        className='w-[56px] h-[56px] border-2 border-secondary rounded-full overflow-hidden
                                                    justify-center'
                                    >
                                        {avatarUploading ? (
                                            <ActivityIndicator size="large" color="#ffffff" />
                                        ) : (
                                            <Image
                                                source={{ uri: user?.avatar }}
                                                className='w-full h-full'
                                                resizeMode='cover'
                                            />
                                        )}

                                    </View>
                                </TouchableOpacity>
                                <Text className='text-white text-xl font-psemibold mt-2.5 '>{user?.username}</Text>
                            </View>
                            {/* 待实现的数据视图 */}
                            {/* <View className='flex-row space-x-14 mt-4 justify-center'>
                                <View className='items-center'>
                                    <Text className='text-white font-psemibold text-xl'>?</Text>
                                    <Text className='text-gray-100 text-sm'>Posts</Text>
                                </View>
                                <View className='items-center'>
                                    <Text className='text-white font-psemibold text-xl'>?</Text>
                                    <Text className='text-gray-100 text-sm'>Views</Text>
                                </View>

                            </View> */}
                        </View>
                    );
                }}
                // renderItem 接受一个对象参数，通常解构为 { item, index, separators }
                renderItem={({ item }) => {
                    return (
                        <VideoCard post={item} handleRefresh={handleRefresh} setCurrentPlayingPost={setCurrentPlayingPost} />
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
                                onPress={() => router.push('/create')}
                            />
                        </View>
                    );
                }}

                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }

            />
            <StatusBar style='light' />
        </SafeAreaView>
    )
}

