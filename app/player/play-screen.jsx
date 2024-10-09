import { StyleSheet, View, Button, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from 'expo-video';


export default function PlayScreen() {
    const { post } = useLocalSearchParams();
    const parsedPost = post ? JSON.parse(post) : null;

    const ref = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const player = useVideoPlayer(parsedPost.video, player => {
        player.loop = true;
        player.play();
    });

    useEffect(() => {
        const subscription = player.addListener('playingChange', isPlaying => {
            setIsPlaying(isPlaying);
        });

        // 监听 statusChange 事件，更新状态
        const statusSubscription = player.addListener('statusChange', (newStatus) => {
            if (newStatus === 'readyToPlay') {
                setIsLoading(false);
                console.log('Video is ready to play.');
            } else if (newStatus === 'loading') {
                setIsLoading(true);
                console.log('Video is loading...');
            } else if (newStatus === 'error') {
                console.error('Error loading video');
            }
        });

        return () => {
            subscription.remove();
            statusSubscription.remove();
        };
    }, [player]);

    return (
        <View
            style={styles.contentContainer}
            className='bg-primary'
        >
            <VideoView
                ref={ref}
                style={styles.video}
                player={player}
                allowsFullscreen
                allowsPictureInPicture
            />
            {isLoading && (
                <ActivityIndicator
                    size="large"
                    color="#fff"
                    style={styles.loadingIndicator}
                />
            )}
            <View style={styles.controlsContainer}>
                <Button
                    title={isPlaying ? 'Pause' : 'Play'}
                    onPress={() => {
                        if (isPlaying) {
                            player.pause();
                        } else {
                            player.play();
                        }
                        setIsPlaying(!isPlaying);
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 50,
        position: 'relative',
    },
    video: {
        width: 350,
        height: 275,
    },
    controlsContainer: {
        padding: 10,
    },
    loadingIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: 32.5 }, { translateY: -35 }]
    }
});