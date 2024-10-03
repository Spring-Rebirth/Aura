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
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    FlatList, ImageBackground, Text, TouchableOpacity, View, Image, ActivityIndicator, Pressable,
    Alert
} from 'react-native'

function TrendingItem({ activeItem, item }) {
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { user, setUser } = useGlobalContext();
    const [isSaved, setIsSaved] = useState(user.favorite.includes($id));
    const { $id } = item;
    const { updatePlayData } = useContext(PlayDataContext);
    const { played_counts } = item;
    const [playCount, setPlayCount] = useState(
        played_counts
    );

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
            await updateSavedCount($id, isIncrement);
        } catch (error) {
            console.error("Error handling favorite:", error);
            Alert.alert('An error occurred while updating favorite count');
        }
    }

    const handlePlay = async () => {
        setPlaying(true);
        setLoading(true);
        // setCurrentPlayingPost(post); // 设置当前播放的视频

        // 正确递增播放次数
        const newCount = playCount + 1;
        updatePlayData($id, newCount);
    };

    useEffect(() => {
        setIsSaved(user.favorite.includes($id));

        // 加载本地存储的播放次数
        const loadPlayCount = async () => {
            try {
                const storedData = await AsyncStorage.getItem('playData');
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    if (parsedData[$id]) {
                        setPlayCount(parsedData[$id].count);
                    }
                }
            } catch (error) {
                console.error('加载播放数据失败:', error);
            }
        };

        loadPlayCount();
    }, [user, isSaved, $id]);

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
                    className='relative justify-center items-center bg-[#494965] w-[208px] h-[332px]
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
