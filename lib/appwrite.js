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

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.
    ;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register User
export const registerUser = async (email, password, username) => {
    try {
        // 注册新用户
        const newAccount = await account.create(ID.unique(), email, password, username);

        const avatarURL = avatars.getInitials(username); // 获取头像URL

        await signIn(email, password); // 用户登录
        const currentUser = await account.get();
        // 创建用户文档
        const newUser = await databases.createDocument(
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

        return newUser; // 返回新创建的用户文档

    } catch (error) {
        throw new Error(error.message); // 捕获并抛出有意义的错误信息
    }
}

export async function signIn(email, password) {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        throw new Error(error.message);  // 仅抛出有用的错误信息
    }
}

export async function getCurrentUser() {
    try {
        let session;
        try {
            session = await account.get(); // 获取当前会话    这个方法可能抛出异常
            console.log('User is logged in');
        } catch (error) {
            console.log('User is not logged in');
            return null;
        }


        if (!session) {
            console.log('No session found. User is not signed in.');
            return null;
        }

        const currentUsers = await databases.listDocuments(
            config.databaseId,
            config.usersCollectionId,
            [Query.equal('accountId', session.$id)]
        );

        if (!currentUsers.documents.length) {
            console.log("No user documents found for the current session.");
            return null; // 如果没有找到用户文档，返回 null
        }
        return currentUsers.documents[0]; // 只返回其中的一个用户文档
    } catch (error) {
        console.error("Error in getCurrentUser:", error); // 输出详细的错误信息
        return null;
    }
}

export async function getAllPosts() {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videosCollectionId
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function getLatestPosts() {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videosCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(5))]
        )

        return posts.documents;
    } catch (error) {
        console.error('Error in getLatestPosts ' + error);
        throw new Error(error.message);
    }
}

export async function searchPosts(query) {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videosCollectionId,
            [Query.search('title', query)]
        )

        return posts.documents;
    } catch (error) {
        console.error('Error in searchPosts ' + error);
        throw new Error(error.message);
    }
}