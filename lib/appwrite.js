// cSpell:disable
import { Client, Account, ID, Avatars, Databases, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.mystseed.aora',
    projectId: '66e00f73002ee6e0e71f',
    databaseId: '66e0120d0001cf7791eb',
    usersCollectionId: '66e01296000e1559c22d',
    videosCollectionId: '66e012ab002da534981d',
    storageId: '66e0170c001977799119'
};

// Init your React Native SDK
const client = new Client();
client.setEndpoint(config.endpoint).setProject(config.projectId).setPlatform(config.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

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
        const newAccount = await account.create(ID.unique(), email, password, username);
        const avatarURL = avatars.getInitials(username);
        await signIn(email, password);
        const currentUser = await account.get();

        // 创建用户文档
        return await databases.createDocument(
            config.databaseId,
            config.usersCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: currentUser.email,
                username: currentUser.name,
                avatar: avatarURL
            }
        );
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
        [],
        'Failed to fetch all posts'
    );
}

// 获取最新帖子
export async function getLatestPosts() {
    return await fetchData(
        config.databaseId,
        config.videosCollectionId,
        [Query.orderDesc('$createdAt', Query.limit(5))],
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
        [Query.equal('creator', userId)],
        'Failed to get user posts'
    );
}
