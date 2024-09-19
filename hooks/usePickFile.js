import * as DocumentPicker from 'expo-document-picker';

export function usePickFile(setFiles) {
    // 选择图片的函数
    const pickImage = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['image/*'], // 只允许选择图片
            copyToCacheDirectory: true,
            multiple: false, // 如果你想允许多文件选择，将其改为 true
        });

        if (!result.canceled && result.assets) {
            setFiles((prev) => ({
                ...prev,
                image: {
                    uri: result.assets[0].uri,       // 文件路径
                    name: result.assets[0].name,     // 文件名
                    mimeType: result.assets[0].mimeType // 文件类型
                }
            }));
            console.log('Image selected:', result);
            return result;
        }
    };

    // 选择视频的函数
    const pickVideo = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['video/*'], // 只允许选择视频
            copyToCacheDirectory: true,
            multiple: false, // 如果你想允许多文件选择，将其改为 true
        });

        if (!result.canceled && result.assets) {
            setFiles((prev) => ({
                ...prev,
                video: {
                    uri: result.assets[0].uri,       // 文件路径
                    name: result.assets[0].name,     // 文件名
                    mimeType: result.assets[0].mimeType // 文件类型
                }
            }));
            console.log('Video selected:', result);
            return result;
        }
    };

    return { pickImage, pickVideo };
}
