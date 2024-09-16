import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { icons } from '../constants'

export default function VideoCard({ video: { title, thumbnail, video, creator: { username, avatar } } }) {
    const [playing, setPlaying] = useState(false);

    return (
        <View className='my-4 mx-4'>
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
                <Image
                    source={icons.menu}
                    className='w-5 h-5'
                    resizeMode='contain'
                />
            </View>

            {/* 视频视图 */}
            {!playing
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
                            className='w-12 h-12 absolute'
                            resizeMode='contain'
                        />
                    </TouchableOpacity>

                )
                : null
            }

        </View>
    )
}