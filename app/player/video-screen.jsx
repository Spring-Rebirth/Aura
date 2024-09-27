import { SafeAreaView } from 'react-native-safe-area-context'
import { ResizeMode, Video } from 'expo-av';

function VideoScreen({ videoUrl }) {


    return (
        <SafeAreaView className='bg-primary'>

            <Video
                source={{ uri: videoUrl }}
                useNativeControls
                onFullscreenUpdate={handleFullscreenUpdate}
                style={isFullscreen ? styles.fullscreenVideo : styles.normalVideo}
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
                        />
                    </View>
                </Modal>
            )}

        </SafeAreaView>
    )
}

export default VideoScreen;