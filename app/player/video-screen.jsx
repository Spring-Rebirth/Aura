import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Modal, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

function VideoScreen({ videoUri }) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleFullscreenUpdate = (status) => {
        if (status.didJustEnterFullscreen) {
            setIsFullscreen(true);
        } else if (status.didJustExitFullscreen) {
            setIsFullscreen(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#161622' }}>
            <Video
                source={{ uri: videoUri }}
                useNativeControls
                onFullscreenUpdate={handleFullscreenUpdate}
                style={isFullscreen ? styles.fullscreenVideo : styles.normalVideo}
                resizeMode="contain"
                shouldPlay
            />

            {isFullscreen && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isFullscreen}
                    onRequestClose={() => setIsFullscreen(false)}
                >
                    <View style={styles.modalContainer}>
                        <Video
                            source={{ uri: videoUri }}
                            useNativeControls
                            onFullscreenUpdate={handleFullscreenUpdate}
                            style={styles.fullscreenVideo}
                            resizeMode="contain"
                            shouldPlay
                        />
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    normalVideo: {
        width: '100%',
        height: 300,
    },
    fullscreenVideo: {
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#161622',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default VideoScreen;
