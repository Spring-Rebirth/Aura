import { View, Text, Dimensions, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams } from "expo-router";
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlayScreen() {
    const { post } = useLocalSearchParams();
    const parsedPost = post ? JSON.parse(post) : null;

    console.log('PlayScreen - post:', JSON.stringify(parsedPost, null, 4));

    const screenHight = Dimensions.get('window').width * 9 / 16;
    console.log('screenHight:', screenHight);

    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    return (
        <SafeAreaView className="bg-primary h-screen">
            <View className='w-screen h-screen bg-primary'>
                {loading && (
                    <ActivityIndicator size="large" color="#fff" style={{
                        position: 'absolute', top: '10%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }]
                    }} />
                )}
                <Video
                    source={{ uri: parsedPost.video }}
                    className={`relative w-full h-[252]`}
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
                />
            </View>
        </SafeAreaView>
    )
}