import * as FileSystem from 'expo-file-system';
import { createFile } from '../lib/appwrite';

// 处理文件上传
export const useUploadFile = async (file) => {
    try {
        // 检查 file 是否有效
        if (!file) {
            throw new Error('File does not exist');
        }



        const { mimeType, name, size, uri } = file.assets[0];
        // 读取文件内容
        // const encodingType = mimeType.startsWith('image/') || mimeType.startsWith('video/')
        //     ? FileSystem.EncodingType.Base64
        //     : FileSystem.EncodingType.UTF8;

        // const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: encodingType });
        const fileModel = { name, type: mimeType, size, uri };
        // 创建文件
        const { response, fileId } = await createFile(fileModel);

        console.log('File uploaded successfully', response, '\n', 'fileId:', fileId);
        return { response, fileId };
    } catch (error) {
        console.error('File upload failed', error.message || error);
        throw error;
    }
};
