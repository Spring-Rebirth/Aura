import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export function usePickFile(setFiles) {
    // 选择图片的函数
    const pickImage = async () => {

        const result = await DocumentPicker.getDocumentAsync({
            type: ['image/*'], // 只允许选择图片
            copyToCacheDirectory: true,
            multiple: false, // 如果你想允许多文件选择，将其改为 true
        });

        // if (result.type === 'success') {
        //     setFiles((prev) => ({ ...prev, image: result }));
        //     console.log('Image selected:', result); // 直接在这里输出
        // }

        if (!result.canceled) {
            setFiles((prev) => ({ ...prev, image: result }));
            console.log('Image selected:', result); // 直接在这里输出
        }
    };

    // 选择视频的函数
    const pickVideo = async () => {

        const result = await DocumentPicker.getDocumentAsync({
            type: ['video/*'], // 只允许选择视频
            copyToCacheDirectory: true,
            multiple: false, // 如果你想允许多文件选择，将其改为 true
        });

        // if (result.type === 'success') {
        //     setFiles((prev) => ({ ...prev, video: result }));
        //     console.log('Video selected:', result); // 直接在这里输出
        // }

        if (!result.canceled) {
            setFiles((prev) => ({ ...prev, video: result }));
            console.log('Video selected:', result); // 直接在这里输出
        }

    };

    return { pickImage, pickVideo }
}