// cSpell:ignore Pressable
import { View, Text, Image, TouchableOpacity, Pressable, Alert } from 'react-native'
import { useEffect, useState } from 'react'
import { icons } from '../constants'
import { ResizeMode, Video } from 'expo-av';
import star from '../assets/menu/star-solid.png'
import trash from '../assets/menu/trash-solid.png'
import { useGlobalContext } from '../context/GlobalProvider'
import { deleteVideoDoc, deleteVideoFiles } from '../lib/appwrite'
import { useRoute } from '@react-navigation/native';
import { updateSavedCount } from '../lib/appwrite';


export default function VideoCard({
    post: { $id, title, thumbnail, video, creator: { accountId, username, avatar } },
    handleRefresh
}) {
    const [playing, setPlaying] = useState(false);
    const [showControlMenu, setShowControlMenu] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isVideoCreator, setIsVideoCreator] = useState(false);
    const { user, setUser, fileIdStore } = useGlobalContext();

    const route = useRoute();
    const currentPath = route.name;

    const handleAddSaved = async () => {
        try {
            let isIncrement;

            if (!user.favorite.includes($id)) {
                // 深拷贝对象
                const newUser = JSON.parse(JSON.stringify(user));
                newUser.favorite.push($id);
                setUser(prev => ({
                    ...prev,
                    favorite: newUser.favorite
                }))
                setIsSaved(true);
                isIncrement = true;
                Alert.alert('Save successful');
            } else {
                // 剔除已保存项的新数组
                const updatedItems = user.favorite.filter(item => item !== $id);
                setUser(prev => ({
                    ...prev,
                    favorite: updatedItems
                }))
                setIsSaved(false);
                isIncrement = false;
                Alert.alert('Cancel save successfully');
            }
            await updateSavedCount($id, post);
        } catch (error) {
            console.error("Error handling favorite:", error);
            Alert.alert('An error occurred while updating favorite count');
        }
    }


    const handleClickSave = () => {
        setShowControlMenu(false);
        handleAddSaved();
    }

    const handleDelete = async () => {
        setShowControlMenu(false);

        const foundItem = fileIdStore.find(item => item.postId === $id);
        if (foundItem) {
            const { imageId, videoId } = foundItem;
            console.log("Image ID:", imageId);
            console.log("Video ID:", videoId);

            try {
                // 使用 Promise.all 并行执行多个异步操作
                await Promise.all([
                    deleteVideoDoc($id), // 假设这个函数删除文档
                    deleteVideoFiles(imageId), // 假设这个函数删除文件
                    deleteVideoFiles(videoId)
                ]);
                console.log("删除成功");
                handleRefresh();
                Alert.alert('Delete Success');
            } catch (error) {
                console.error("删除过程中出错:", error);
            }
        } else {
            console.log("未找到匹配的 postId, fileIdStore这个视频的文件ID");
            Alert.alert('This is a demonstration video and cannot be deleted');
        }
    }


    useEffect(() => {
        if (accountId === user.accountId) {
            setIsVideoCreator(true);
        }
    }, [])


    return (
        <View className='my-4 mx-4 relative'>
            {/* 菜单弹窗 */}
            {showControlMenu ? (
                <View
                    className='absolute right-1 top-8 bg-[#1E1E2D] w-40 h-auto rounded-md z-10
                                px-6 py-0 '
                >
                    <Pressable
                        onPress={handleClickSave}
                        className='w-full h-12 flex-row items-center'
                    >
                        <Image
                            source={star}
                            className='w-5 h-5 mr-3'
                        />
                        {currentPath === 'saved' ? (
                            <Text className='text-white text-lg'>Remove</Text>
                        ) : (
                            <Text className='text-white text-lg'>
                                {isSaved ? ('Saved' + '    √') : 'Save'}
                            </Text>
                        )}

                    </Pressable>
                    {isVideoCreator ? (
                        <Pressable
                            onPress={handleDelete}
                            className='w-full h-12 flex-row items-center'
                        >
                            <Image
                                source={trash}
                                className='w-5 h-5 mr-3'
                            />
                            <Text className='text-white text-lg'>Delete</Text>
                        </Pressable>
                    ) : false}


                </View>
            ) : false
            }

            {/* 信息视图 */}
            <View className='flex-row'>
                <Image
                    source={{ uri: avatar }}
                    className='w-[46px] h-[46px] border border-secondary rounded-lg'
                />
                <View className='gap-y-1 justify-center flex-1 mx-3'>
                    <Text className='text-white font-psemibold text-sm' numberOfLines={1}>
                        {title}
                    </Text>
                    <Text className='text-gray-100 font-pregular text-xs' numberOfLines={1}>
                        {username}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => setShowControlMenu(prev => !prev)}>
                    <Image
                        source={icons.menu}
                        className='w-5 h-5'
                        resizeMode='contain'
                    />
                </TouchableOpacity>

            </View>

            {/* 视频视图 */}
            {
                !playing
                    ? (
                        <TouchableOpacity
                            className='w-full h-60 mt-6 rounded-xl justify-center items-center relative overflow-hidden' // 添加 overflow-hidden
                            activeOpacity={0.7}
                            onPress={() => setPlaying(true)}
                        >
                            <Image
                                source={{ uri: thumbnail }}
                                className='w-full h-full rounded-xl'
                                resizeMode='cover' // 修改为 cover
                            />
                            <Image
                                source={icons.play}
                                className='w-12 h-12 absolute inset-0 m-auto'
                                resizeMode='cover'
                            />
                        </TouchableOpacity>

                    )
                    : (
                        // latest changed code
                        <Video
                            source={{ uri: video }}
                            className='w-full h-60 rounded-xl mt-6'
                            resizeMode={ResizeMode.CONTAIN}
                            useNativeControls
                            shouldPlay
                            onPlaybackStatusUpdate={(status) => {
                                if (status.didJustFinish) {
                                    setPlaying(false);
                                }
                            }}
                        />

                    )
            }

        </View >
    )
}