// cSpell:ignore Pressable
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native'
import { useState } from 'react'
import { icons } from '../constants'
import { ResizeMode, Video } from 'expo-av';
import star from '../assets/menu/star-solid.png'
import trash from '../assets/menu/trash-solid.png'

export default function VideoCard({
    post: { $id, title, thumbnail, video, creator: { username, avatar, favorite } },
    handleAddSaved,
    handleDelete
}) {
    const [playing, setPlaying] = useState(false);
    const [showControlMenu, setShowControlMenu] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleClickSave = () => {
        setShowControlMenu(false);
        handleAddSaved($id);
        setIsSaved(true);
    }


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
                        <Text className='text-white text-lg'>
                            {isSaved ? 'Saved' + '    √' : 'Save'}
                        </Text>
                    </Pressable>

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