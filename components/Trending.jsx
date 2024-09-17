import React from 'react'
import { FlatList, ImageBackground, Text, TouchableOpacity, View, Image } from 'react-native'
import * as Animatable from 'react-native-animatable'
import { icons } from '../constants';
import { Video, ResizeMode } from 'expo-av';

function TrendingItem({ activeItem, item }) {
    const [playing, setPlaying] = React.useState(false);

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
                    />
                    <Image
                        source={icons.play}
                        className='w-12 h-12 absolute'
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            ) : (
                <Video
                    source={{ uri: item.video }}
                    className='w-[208px] h-[332px] rounded-[24px]'
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay
                    onPlaybackStatusUpdate={(status) => {
                        if (status.didJustFinish) {
                            setPlaying(false);
                        }
                    }}
                />


            )}
        </Animatable.View>
    )

}

export default function Trending({ video }) {
    const [activeItem, setActiveItem] = React.useState(video[1]);
    // cSpell: words viewability
    const viewabilityConfig = { itemVisiblePercentThreshold: 70 }; // 配置可见性百分比

    // 使用 useCallback 确保 handleViewableItemsChanged 能正确访问 setActiveItem
    const handleViewableItemsChanged = React.useCallback(({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0) {
            setActiveItem(viewableItems[0].item); // 访问每个可见项的实际 item
        }
    }, [setActiveItem]); // 将 setActiveItem 作为依赖

    return (
        <FlatList
            horizontal
            className=''
            data={video}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
                <TrendingItem item={item} activeItem={activeItem} />
            )}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
        />
    )
}
