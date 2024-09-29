// cSpell:ignore Pressable
import { View, Text, Image, TouchableOpacity, Pressable, Alert, ActivityIndicator } from 'react-native'
import { useEffect, useState, useRef } from 'react'
import { icons } from '../constants'
import { ResizeMode, Video } from 'expo-av';
import star from '../assets/menu/star-solid.png'
import trash from '../assets/menu/trash-solid.png'
import { useGlobalContext } from '../context/GlobalProvider'
import { deleteVideoDoc, deleteVideoFiles } from '../lib/appwrite'
import { useRoute } from '@react-navigation/native';
import { updateSavedCount, getVideoDetails } from '../lib/appwrite';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';


export default function VideoCard({
    post,
    handleRefresh,
    toggleFullscreen,
    setCurrentPlayingPost,
    isFullscreen,
}) {
    const { $id, title, thumbnail, video, creator: { accountId, username, avatar } } = post;
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showControlMenu, setShowControlMenu] = useState(false);

    const [isVideoCreator, setIsVideoCreator] = useState(false);
    const { user, setUser } = useGlobalContext();
    const [isSaved, setIsSaved] = useState(user.favorite.includes($id));
    const [imageLoaded, setImageLoaded] = useState(false);

    const videoRef = useRef(null);
    const route = useRoute();
    const currentPath = route.name;
    const aspectRatio = 16 / 9; // 你可以根据需要调整这个比例


    const onFullscreenUpdate = async ({ fullscreenUpdate }) => {
        if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            toggleFullscreen(true);
        } else if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            toggleFullscreen(false);
        }
    };



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
                setIsSaved(prevIsSaved => {
                    console.log("Saving, previous isSaved:", prevIsSaved);
                    return true;
                });
                isIncrement = true;
                Alert.alert('Save successful');
            } else {
                // 剔除已保存项的新数组
                const updatedItems = user.favorite.filter(item => item !== $id);
                setUser(prev => ({
                    ...prev,
                    favorite: updatedItems
                }))
                setIsSaved(prevIsSaved => {
                    console.log("Removing, previous isSaved:", prevIsSaved);
                    return false;
                });
                isIncrement = false;
                Alert.alert('Cancel save successfully');
            }
            await updateSavedCount($id, isIncrement);
        } catch (error) {
            console.error("Error handling favorite:", error);
            Alert.alert('An error occurred while updating favorite count');
        }
    }

    const handleClickSave = () => {
        console.log("Before click, isSaved:", isSaved); // Debugging
        setShowControlMenu(false);
        handleAddSaved();

    }

    const handleDelete = async () => {
        setShowControlMenu(false);

        try {
            const videoDetails = await getVideoDetails($id); // 假设 getVideoDetails 从数据库获取视频详细信息
            const { imageId, videoId } = videoDetails;

            if (imageId && videoId) {
                await Promise.all([
                    deleteVideoDoc($id), // 删除视频文档
                    deleteVideoFiles(imageId), // 删除图片文件
                    deleteVideoFiles(videoId)  // 删除视频文件
                ]);
                console.log("删除成功");
                handleRefresh();
                Alert.alert('Delete Success');
            } else {
                console.log("未找到与该视频关联的文件 ID");
                Alert.alert('File ID not found');
            }
        } catch (error) {
            console.error("删除过程中出错:", error);
        }
    }


    useEffect(() => {
        if (accountId === user.accountId) {
            setIsVideoCreator(true);
        }
    }, [isSaved]);

    return (
        <View className={`relative ${isFullscreen ? 'flex-1 w-full h-full' : 'my-4 '}`}>
            {/* 在全屏模式下隐藏状态栏 */}
            {isFullscreen && <StatusBar hidden />}

            {/* 视频视图 */}
            {
                !playing
                    ? (
                        <TouchableOpacity
                            className='w-full h-56 justify-center items-center relative overflow-hidden' // 添加 overflow-hidden
                            activeOpacity={0.7}
                            onPress={() => {
                                setPlaying(true);
                                setLoading(true);
                                setCurrentPlayingPost(post); // 设置当前播放的视频
                            }}
                        >

                            <Image
                                source={{ uri: thumbnail }}
                                className='w-full h-full mb-4'
                                resizeMode='cover'
                                onLoad={() => setImageLoaded(true)}
                                onError={() => {
                                    setImageLoaded(false);
                                    console.log("Failed to load image.");
                                }}
                            />
                            {!imageLoaded ? (
                                <ActivityIndicator size="large" color="#fff" style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }]
                                }} />
                            ) : (
                                <Image
                                    source={icons.play}
                                    className='w-12 h-12 absolute inset-0 m-auto'
                                    resizeMode='cover'
                                />
                            )}

                        </TouchableOpacity>

                    ) : (

                        <>
                            {loading && (
                                <ActivityIndicator size="large" color="#fff" style={{
                                    position: 'absolute', top: '30%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }]
                                }} />
                            )}

                            <Video
                                ref={videoRef}
                                source={{ uri: video }}
                                className={isFullscreen ? 'flex-1 w-full h-full' : 'w-full h-56 mb-4'}
                                resizeMode={ResizeMode.CONTAIN}
                                useNativeControls
                                shouldPlay
                                onPlaybackStatusUpdate={async (status) => {
                                    if (status.isLoaded) {
                                        setLoading(false);
                                    }
                                    if (status.didJustFinish) {
                                        setPlaying(false);
                                        setLoading(true);
                                    }
                                }}
                                onFullscreenUpdate={onFullscreenUpdate}
                            />
                        </>
                    )
            }

            {!isFullscreen && (
                <>
                    {/* 菜单弹窗 */}
                    {showControlMenu ? (
                        <View
                            className='absolute right-2 bottom-[77px] bg-[#1E1E2D] w-40 h-auto rounded-md z-10 px-6 py-0'
                        >
                            <Pressable
                                onPress={handleClickSave}
                                className='w-full h-12 flex-row items-center'
                            >
                                <Image
                                    source={star}
                                    className='w-5 h-5 mr-3'
                                />
                                <Text className='text-white text-lg'>
                                    {currentPath === 'saved' ? 'Remove' : (isSaved ? 'Saved    √' : 'Save')}
                                </Text>
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
                            ) : null}
                        </View>
                    ) : null}

                    {/* 信息视图 */}
                    <View className='flex-row mb-3.5 mt-1.5 mx-2'>
                        <Image
                            source={{ uri: avatar }}
                            className='w-[46px] h-[46px] border border-secondary rounded-lg ml-2'
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
                                className='w-5 h-5 mr-2'
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>
                </>
            )}

        </View >
    )
}