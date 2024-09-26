import { useState } from 'react'
import { FlatList, ImageBackground, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native'
import * as Animatable from 'react-native-animatable'
import { icons } from '../constants';
import { Video, ResizeMode } from 'expo-av';
import EmptyState from '../components/EmptyState'


function TrendingItem({ activeItem, item }) {
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);

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

    return (
        <Animatable.View
            animation={activeItem.$id === item.$id ? zoomIn : zoomOut}
            duration={500}
            style={{ borderRadius: 16, overflow: 'hidden' }} // 使用样式直接设置圆角
            className='mr-2'
        >

            {!playing ? (
                <TouchableOpacity onPress={() => setPlaying(true)}
                    className='relative justify-center items-center'
                >
                    <ImageBackground
                        source={{ uri: item.thumbnail }}
                        className='w-[208px] h-[332px] rounded-[24px] overflow-hidden'
                        resizeMode='cover'
                        onLoad={() => setImageLoaded(true)}  // 图片加载成功
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
                            className='w-12 h-12 absolute'
                            resizeMode='contain'
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
                    <Video
                        source={{ uri: item.video }}
                        className='w-[208px] h-[332px] rounded-[24px]'
                        resizeMode={ResizeMode.CONTAIN}
                        useNativeControls
                        shouldPlay
                        onPlaybackStatusUpdate={(status) => {
                            setLoading(false);
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
            ListEmptyComponent={() => {
                return loading ? (
                    <View className="flex-1 justify-center items-center bg-primary mt-64">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className='mt-[10] text-white text-xl'>Loading, please wait...</Text>
                    </View>
                ) : (
                    <View>
                        <EmptyState />

                    </View>
                );
            }}
        />
    )
}
