// cSpell:ignore Pressable
import { useState, useEffect, useContext } from 'react'
import * as Animatable from 'react-native-animatable'
import { icons } from '../constants';
import { Video, ResizeMode } from 'expo-av';
import star from '../assets/menu/star-solid.png'
import starThree from '../assets/menu/star3.png'
import { useGlobalContext } from '../context/GlobalProvider'
import { updateSavedCount } from '../lib/appwrite';
import closeY from '../assets/menu/close-yuan.png'
import { PlayDataContext } from '../context/PlayDataContext';
import {
    FlatList, ImageBackground, Text, TouchableOpacity, View, Image, ActivityIndicator,
    Alert
} from 'react-native'

function TrendingItem({ activeItem, item }) {
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { user, setUser } = useGlobalContext();
    const { played_counts, $id } = item;
    const [isSaved, setIsSaved] = useState(user?.favorite.includes($id));
    const [playCount, setPlayCount] = useState(played_counts || 0);
    const { updatePlayData, playDataRef } = useContext(PlayDataContext);

    const zoomIn = {
        0: {
            scale: 0.9,
        },
        1: {
            scale: 1,
        }
    }
    const zoomOut = {
        0: {
            scale: 1,
        },
        1: {
            scale: 0.9,
        }
    }

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
                setIsSaved(true);
                isIncrement = true;
                Alert.alert('Save successful');
            } else {
                // 剔除已保存项的新数组
                const updatedItems = user?.favorite.filter(item => item !== $id);
                setUser(prev => ({
                    ...prev,
                    favorite: updatedItems
                }))
                setIsSaved(false);
                isIncrement = false;
                Alert.alert('Cancel save successfully');
            }
            await updateSavedCount($id, isIncrement);
        } catch (error) {
            console.error("Error handling favorite:", error);
            Alert.alert('An error occurred while updating favorite count');
        }
    }

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
    };


    return (
        <Animatable.View
            animation={activeItem.$id === item.$id ? zoomIn : zoomOut}
            duration={500}
            style={{ borderRadius: 16, overflow: 'hidden' }} // 使用样式直接设置圆角
            className='mr-2 relative'
        >
            <TouchableOpacity
                onPress={handleAddSaved}
                className='absolute z-10 top-3 right-3'
            >
                <Image
                    source={isSaved ? star : starThree}
                    className='w-7 h-7'
                    resizeMode='contain'
                />
            </TouchableOpacity>


            {!playing ? (
                <TouchableOpacity onPress={handlePlay}
                    className='relative justify-center items-center bg-[#33466C] w-[208px] h-[332px]
                                rounded-[24px] overflow-hidden'
                >
                    <ImageBackground
                        source={{ uri: item.thumbnail }}
                        className='w-full h-32 '
                        resizeMode='cover'
                        onLoad={() => setImageLoaded(true)}  // 图片加载成功
                        onError={() => {
                            setImageLoaded(false);
                            console.log("Failed to load image.");
                        }}
                    />

                    {!imageLoaded && (
                        <ActivityIndicator
                            size="large" color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }] }}
                        />
                    )}

                </TouchableOpacity>
            ) : (
                <>
                    {loading && (
                        <ActivityIndicator size="large" color="#fff" style={{
                            position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }]
                        }} />

                    )}
                    <TouchableOpacity
                        onPress={() => {
                            setPlaying(false);
                            setLoading(true);
                        }}
                        className='absolute top-3 left-3 z-10'
                    >
                        <Image
                            source={closeY}
                            className='w-7 h-7'
                        />
                    </TouchableOpacity>
                    <Video
                        source={{ uri: item.video }}
                        className='w-[208px] h-[332px] rounded-[24px]'
                        resizeMode={ResizeMode.CONTAIN}
                        useNativeControls
                        shouldPlay
                        onPlaybackStatusUpdate={(status) => {
                            if (status.isLoaded) {
                                setLoading(false);
                            }
                            if (status.didJustFinish) {
                                setPlaying(false);
                                setLoading(true);
                            }
                        }}
                    />
                </>
            )}

        </Animatable.View>
    )

}

export default function Trending({ video, loading }) {
    // cSpell: words viewability
    const viewabilityConfig = { itemVisiblePercentThreshold: 70 }; // 配置可见性百分比

    const [activeItem, setActiveItem] = useState(video && video.length > 0 ? video[0] : null); // 设置默认 activeItem

    const handleViewableItemsChanged = ({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0) {
            setActiveItem(viewableItems[0].item); // 访问每个可见项的实际 item
        }
    };

    return loading ? (
        <View className="flex-1 justify-center items-center bg-primary mt-12">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className='mt-[10] text-white text-xl'>Loading, please wait...</Text>
        </View>
    ) : (
        <FlatList
            horizontal
            className=''
            data={loading || video.length === 0 ? [] : video}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
                <TrendingItem item={item} activeItem={activeItem} />
            )}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}

        />
    )
}
