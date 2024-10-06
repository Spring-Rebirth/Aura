// cSpell:ignore Pressable
import { View, Text, Image, TouchableOpacity, Pressable, Alert, ActivityIndicator } from 'react-native'
import { useEffect, useState, useRef, useContext } from 'react'
import { icons } from '../constants'
import { ResizeMode, Video } from 'expo-av';
import star from '../assets/menu/star-solid.png'
import starThree from '../assets/menu/star3.png'
import trash from '../assets/menu/trash-solid.png'
import { useGlobalContext } from '../context/GlobalProvider'
import { deleteVideoDoc, deleteVideoFiles } from '../lib/appwrite'
import { useRoute } from '@react-navigation/native';
import { updateSavedCount, getVideoDetails } from '../lib/appwrite';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import closeY from '../assets/menu/close-yuan.png'
import { PlayDataContext } from '../context/PlayDataContext';
import { formatNumberWithUnits } from '../utils/numberFormatter';

export default function VideoCard({
    post,
    handleRefresh,
    toggleFullscreen,
    setCurrentPlayingPost,
    isFullscreen,
}) {
    const { $id, $createdAt, title, thumbnail, video, played_counts, creator: { accountId, username, avatar } } = post;
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showControlMenu, setShowControlMenu] = useState(false);

    const [isVideoCreator, setIsVideoCreator] = useState(false);
    const { user, setUser } = useGlobalContext();
    const [isSaved, setIsSaved] = useState(user?.favorite.includes($id));
    const [imageLoaded, setImageLoaded] = useState(false);

    const { updatePlayData, playDataRef } = useContext(PlayDataContext);
    const [playCount, setPlayCount] = useState(played_counts || 0);

    const getRelativeTime = () => {
        const dateObj = new Date($createdAt);
        const now = new Date();

        const diffInMs = now - dateObj; // 时间差，单位为毫秒
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60)); // 转换为分钟
        const diffInHours = Math.floor(diffInMinutes / 60); // 转换为小时
        const diffInDays = Math.floor(diffInHours / 24); // 转换为天
        const diffInWeeks = Math.floor(diffInDays / 7); // 转换为星期
        const diffInMonths = Math.floor(diffInDays / 30); // 粗略转换为月
        const diffInYears = Math.floor(diffInDays / 365); // 粗略转换为年

        if (diffInMinutes < 60) {
            return `${diffInMinutes} min ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} h ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} d ago`;
        } else if (diffInWeeks < 4) {
            return `${diffInWeeks} wk ago`;
        } else if (diffInMonths < 12) {
            return `${diffInMonths} mo ago`;
        } else {
            return `${diffInYears} y ago`;
        }
    };

    const videoRef = useRef(null);
    const route = useRoute();
    const currentPath = route.name;
    const aspectRatio = 16 / 9; // 视频比例
    const adminList = ['cjunwei6249@gmail.com', '1392600130@qq.com', 'zhangwww1998@outlook.com'];
    let admin = adminList.includes(user?.email);
    for (let index = 0; index < adminList.length; index++) {
        if (user?.email === adminList[index]) {
            admin = true;
        }
    }


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

            if (!user?.favorite.includes($id)) {
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
                const updatedItems = user?.favorite.filter(item => item !== $id);
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

        // 加载播放次数
        const currentPlayData = playDataRef.current;
        if (currentPlayData[$id]) {
            const { count } = currentPlayData[$id];
            setPlayCount(count);
        } else {
            setPlayCount(played_counts || 0);
        }
    }, [$id, playDataRef]);
    // cSpell:words cooldown
    const handlePlay = async () => {
        const currentTime = Date.now();
        const cooldownPeriod = 5 * 60 * 1000; // 5分钟

        const lastPlayTime = playDataRef.current[$id]?.lastPlayTime || 0;

        if (currentTime - lastPlayTime > cooldownPeriod) {
            // 冷却时间已过，递增播放次数
            const newCount = playCount + 1;
            setPlayCount(newCount);

            // 更新播放数据并同步到后端
            updatePlayData($id, newCount);
        } else {
            console.log('冷却时间未过，播放次数不增加');
        }

        // 继续播放视频
        setPlaying(true);
        setLoading(true);
        setCurrentPlayingPost(post);
    };


    return (
        <View className={`relative bg-primary ${isFullscreen ? 'flex-1 w-full h-full' : 'my-4 '}`}>
            {/* 在全屏模式下隐藏状态栏 */}
            {isFullscreen && <StatusBar hidden />}

            {/* 视频视图 */}
            {
                !playing
                    ? (
                        <TouchableOpacity
                            className='w-full h-56 justify-center items-center relative overflow-hidden' // 添加 overflow-hidden
                            activeOpacity={0.7}
                            onPress={handlePlay}
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
                            {!imageLoaded && (
                                <ActivityIndicator size="large" color="#fff" style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }]
                                }} />
                            )}

                        </TouchableOpacity>

                    ) : (

                        <>
                            {loading && (
                                <ActivityIndicator size="large" color="#fff" style={{
                                    position: 'absolute', top: '30%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }]
                                }} />
                            )}
                            <TouchableOpacity
                                onPress={() => {
                                    setPlaying(false);
                                    setLoading(true);
                                }}
                                className='absolute -top-3.5 right-2.5 z-10 w-16 h-16 justify-center items-center'
                            >
                                <Image
                                    source={closeY}
                                    className='w-8 h-8'
                                />
                            </TouchableOpacity>
                            <Video
                                ref={videoRef}
                                source={{ uri: video }}
                                className={`relative ${isFullscreen ? 'flex-1 w-full h-full' : 'w-full h-56 mb-4'} `}
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
                                    source={isSaved ? star : starThree}
                                    className='w-5 h-5 mr-3'
                                />
                                <Text className='text-white text-lg'>
                                    {currentPath === 'saved' ? 'Remove' : (isSaved ? 'Saved' : 'Save')}
                                </Text>
                            </Pressable>

                            {(isVideoCreator || admin === true) ? (
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
                    <View className='flex-row mb-3.5 mt-1.5 mx-2 bg-primary'>
                        <Image
                            source={{ uri: avatar }}
                            className='w-[40px] h-[40px] border border-secondary rounded-full ml-2 mt-0.5'
                        />
                        <View className='gap-y-1 justify-center flex-1 ml-5'>
                            <Text className='text-white font-psemibold text-sm' numberOfLines={2}>
                                {title}
                            </Text>
                            <Text className='text-gray-100 font-pregular text-xs' numberOfLines={1}>
                                {username}  ·  {formatNumberWithUnits(playCount)} views  ·  {getRelativeTime()}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowControlMenu(prev => !prev)}>
                            <Image
                                source={icons.menu}
                                className='w-5 h-5 mr-2 ml-3'
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>
                </>
            )}

        </View >
    )
}