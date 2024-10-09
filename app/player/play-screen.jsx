import { StyleSheet, View, Button } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from 'expo-video';


export default function PlayScreen() {
    const { post } = useLocalSearchParams();
    const parsedPost = post ? JSON.parse(post) : null;

    const ref = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const player = useVideoPlayer(parsedPost.video, player => {
        player.loop = true;
        player.play();
    });

    useEffect(() => {
        const subscription = player.addListener('playingChange', isPlaying => {
            setIsPlaying(isPlaying);
        });

        return () => {
            subscription.remove();
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
    },
    video: {
        width: 350,
        height: 275,
    },
    controlsContainer: {
        padding: 10,
    },
});