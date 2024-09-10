// cSpell:disable
import { Client, Account, ID, Avatars, Databases } from 'react-native-appwrite';

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
const database = new Databases(client);

// Register User
export const registerUser = async (email, password, username) => {
    try {
        // 注册新用户
        const newAccount = await account.create(ID.unique(), email, password, username);

        const avatarURL = avatars.getInitials(username); // 获取头像URL

        await signIn(email, password); // 用户登录

        // 创建用户文档
        const newUser = await database.createDocument(
            config.databaseId,
            config.usersCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarURL
            }
        );

        return newUser; // 返回新创建的用户文档

    } catch (error) {
        throw new Error(error.message); // 捕获并抛出有意义的错误信息
    }
}

export async function signIn (email, password) {
    try {
        // const session = await account.createEmailSession(email, password);  教程的代码
        let session = await account.get(); // 获取当前会话
        if (!session){
            session = await account.createEmailPasswordSession(email, password);
        }
        return session;
    } catch (error) {
        throw new Error(error.message);  // 仅抛出有用的错误信息
    }
}
