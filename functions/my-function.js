// const sdk = require('node-appwrite');

// const projectId = '66e00f73002ee6e0e71f';
// const apiKey = 'standard_aecb27b502e936c3e954153982912ebc01da7646c00d51e297ffb0770c2847ad30edce6a11efed3ff818ec9ec7ab15a84b4dbc723a0a6fa6297ede7c55980ab25dc5011969b05a4ce25388c4e5c8a3127852ef84fcd899f462db6221f87ac845c36a5932c130a070847326fe04a620b127611bee31f725e85fce03c6ed89e7f1';


// module.exports = async function (req, res) {

//     const client = new sdk.Client()
//         .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
//         .setProject(projectId) // Your project ID
//         .setKey(apiKey); // Your secret API key

//     const users = new sdk.Users(client);

//     console.log('Request body:', req.body);
//     const { userId } = JSON.parse(req.body);
//     console.log('Parsed userId:', userId);

//     await users.delete(userId);
//     res.json({ success: true, message: `User ${userId} deleted.` });
// }