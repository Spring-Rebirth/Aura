import { createFile } from '../lib/appwrite';

// 处理文件上传
export const useUploadFile = async (file, retries = 3) => {
    try {
        // 检查 file 是否有效
        if (!file) {
            throw new Error('File does not exist');
        }

        const { mimeType, name, size, uri } = file.assets[0];
        const fileModel = { name, type: mimeType, size, uri };

        // 尝试上传，允许重试
        let response, fileId;
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const result = await createFile(fileModel);
                response = result.response;
                fileId = result.fileId;
                console.log('File uploaded successfully on attempt:', attempt + 1);
                break; // 成功上传后退出循环
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error.message || error);
                if (attempt === retries - 1) throw new Error('File upload failed after maximum retries');
            }
        }

        return { response, fileId };
    } catch (error) {
        console.error('Final file upload failure:', error.message || error);
        return null;
    }
};
