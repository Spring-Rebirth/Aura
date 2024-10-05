import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export function usePickFile() {
    // 选择图片的函数
    const pickImage = async () => {
        // 请求权限
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your media library to pick images.');
            return null;
        }

        // 选择图片
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        // 注意这里的 `canceled` 使用了单个 `l`
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            console.log('Image selected:', asset);
            return {
                uri: asset.uri,
                name: asset.fileName || asset.uri.split('/').pop(),
                type: asset.type || asset.mimeType || 'image/jpeg',
            };
        } else {
            console.log('User cancelled image picker');
            return null;
        }
    };

    // 选择视频的函数
    const pickVideo = async () => {
        // 请求权限
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your media library to pick videos.');
            return null;
        }

        // 选择视频
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: false,
            quality: 1,
        });

        // 注意这里的 `canceled` 使用了单个 `l`
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            console.log('Video selected:', asset);
            return {
                uri: asset.uri,
                name: asset.fileName || asset.uri.split('/').pop(),
                type: asset.type || asset.mimeType || 'video/mp4',
            };
        } else {
            console.log('User cancelled video picker');
            return null;
        }
    };

    return { pickImage, pickVideo };
}
import { requestMediaLibraryPermissionsAsync, launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
