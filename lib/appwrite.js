// cSpell:disable
import { Client, Account, ID, Avatars, Databases, Query, Storage, Functions } from 'react-native-appwrite';
import { Client as NodeClient, Users } from 'appwrite';
import { Alert } from 'react-native';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.mystseed.aora',
    projectId: '66e00f73002ee6e0e71f',
    databaseId: '66e0120d0001cf7791eb',
    usersCollectionId: '66e01296000e1559c22d',
    videosCollectionId: '66e012ab002da534981d',
    bucketId: '66e0170c001977799119',
    functionId: '66eff7670021b6ca34c5'
};
const apiKey = 'standard_aecb27b502e936c3e954153982912ebc01da7646c00d51e297ffb0770c2847ad30edce6a11efed3ff818ec9ec7ab15a84b4dbc723a0a6fa6297ede7c55980ab25dc5011969b05a4ce25388c4e5c8a3127852ef84fcd899f462db6221f87ac845c36a5932c130a070847326fe04a620b127611bee31f725e85fce03c6ed89e7f1';


// Init your React Native SDK
const client = new Client();
client.setEndpoint(config.endpoint).setProject(config.projectId).setPlatform(config.platform);

export const account = new Account(client);
export const databases = new Databases(client);
const avatars = new Avatars(client);
const storage = new Storage(client);
const functions = new Functions(client);

// 通用的错误处理函数
const handleError = (error, customMessage = "Error") => {
    console.error(`${customMessage}:`, error.message || error);
    throw new Error(error.message || "Unknown error occurred");
};

// 通用数据库查询函数
const fetchData = async (databaseId, collectionId, queries = [], customErrorMsg = 'Failed to fetch data') => {
    try {
        const result = await databases.listDocuments(databaseId, collectionId, queries);

        return result.documents;
    } catch (error) {
        handleError(error, customErrorMsg);
    }
};

export const registerUser = async (email, password, username) => {
    try {
        // 创建新账户
        const newAccount = await account.create(ID.unique(), email, password, username);

        const avatarURL = avatars.getInitials(username);
        await signIn(email, password);

        return { newAccount, avatarURL };
    } catch (error) {
        handleError(error, 'Failed to register user');
    }
};

export async function signIn(email, password) {
    try {
        const session = await account.getSession('current');
        if (session) await account.deleteSession('current');
    } catch (error) {
        if (error.code !== 404) {
            console.log('Enter the login phase');
        }
    }

    try {
        const newSession = await account.createEmailPasswordSession(email, password);
        return newSession;
    } catch (error) {
        handleError(error, 'Failed in signIn method');
    }
}

export async function signOut() {
    try {
        return await account.deleteSession('current');
    } catch (error) {
        handleError(error, 'Failed to sign out');
    }
}

// Get current user data
export async function getCurrentUser() {
    try {
        const session = await account.get();

        if (!session) return null;

        const currentUserData = await fetchData(
            config.databaseId,
            config.usersCollectionId,
            [Query.equal('accountId', session.$id)],
            'Failed to fetch user data'
        );
        // 返回用户文档
        return currentUserData.length > 0 ? currentUserData[0] : null;

    } catch (error) {
        console.log('Error in getCurrentUser', error);
        return null;
    }
}

// 获取所有帖子
export async function getAllPosts() {
    return await fetchData(
        config.databaseId,
        config.videosCollectionId,
        [Query.orderDesc('$createdAt')],
        'Failed to fetch all posts'
    );
}

// 获取最新帖子
export async function getLatestPosts() {
    return await fetchData(
        config.databaseId,
        config.videosCollectionId,
        [
            Query.orderDesc('$createdAt'),
            Query.limit(7)
        ],
        'Failed to fetch latest posts'
    );
}

// 搜索帖子
export async function searchPosts(query) {
    return await fetchData(
        config.databaseId,
        config.videosCollectionId,
        [Query.search('title', query)],
        'Failed to search posts'
    );
}

// 获取用户帖子
export async function getUserPosts(userId) {
    return await fetchData(
        config.databaseId,
        config.videosCollectionId,
        [
            Query.equal('creator', userId),
            Query.orderDesc('$createdAt')
        ],
        'Failed to get user posts'
    );
}

// 创建文件对象
export async function createFile(fileModel) {
    const fileId = ID.unique(); // 自动生成唯一文件 ID

    try {
        const response = await storage.createFile(
            config.bucketId, // 替换为你的存储桶 ID
            fileId, // 文件 ID
            fileModel // 使用 File 对象封装文件内容和 MIME 类型
        );
        // console.log('response of createFile():', response);
        return { response, fileId };
    } catch (error) {
        console.log('Error in createFile:', error);
    }
}

export const uploadData = async (formData) => {
    try {
        const response = await databases.createDocument(
            config.databaseId, // 替换为你的数据库 ID
            config.videosCollectionId, // 替换为你的集合 ID
            ID.unique(), // 自动生成唯一文档 ID
            formData // 你的表单数据
        );
        console.log('Data uploaded successfully');
        return response;
    } catch (error) {
        handleError(error, 'Data upload failed');
    }
};

export const fetchFileUrl = async (fileId) => {
    try {
        const url = storage.getFileView(
            config.bucketId, // bucketId
            fileId
        );
        return url;
    } catch (error) {
        console.warn('Error in getFileFromStorage:', error);
    }
}

export const updateSavedVideo = async (documentId, data) => {
    try {
        const result = await databases.updateDocument(
            config.databaseId,
            config.usersCollectionId,
            documentId,
            data
        );
        return result;
    } catch (error) {
        console.warn('updateSavedVideo Failed:', error);
    }
}

export async function getSavedPosts(userFavorite) {
    console.log('Enter getSavedPosts()')
    console.log('userFavorite:', userFavorite);
    if (!userFavorite || userFavorite.length === 0) {
        console.log('current user not saved any video');
        return [];  // 返回空数组，表示没有收藏的视频
    }
    return await fetchData(
        config.databaseId,
        config.videosCollectionId,
        [
            // 查询在 user.favorite数组中存在的'$id'
            Query.contains('$id', userFavorite),
            Query.orderDesc('$createdAt')
        ],
        'Failed to get saved posts'
    );
}

export async function deleteVideoDoc(videoId) {
    try {
        const result = await databases.deleteDocument(
            config.databaseId, // databaseId
            config.videosCollectionId, // collectionId
            videoId // documentId
        );
        console.log('deleteDocument-result:', result);
    } catch (error) {
        console.warn('DeleteVideoDoc Failed:', error);
    }
}

export async function deleteVideoFiles(fileId) {
    try {
        const result = await storage.deleteFile(
            config.bucketId, // bucketId
            fileId // fileId
        );
        console.log('deleteFile-result:', result);
    } catch (error) {
        console.warn('DeleteVideoFiles Failed:', error);
    }
}