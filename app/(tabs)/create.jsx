import { useState } from 'react'
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomForm from '../../components/CustomForm'
import CustomButton from '../../components/CustomButton'
import { icons } from '../../constants'
import { usePickFile } from '../../hooks/usePickFile'
import { ResizeMode, Video } from 'expo-av'
import { useGlobalContext } from '../../context/GlobalProvider'
import { useUploadFile } from '../../hooks/useUploadFile'
// cSpell:words appwrite psemibold
import { fetchFileUrl, uploadData } from '../../lib/appwrite'
import { StatusBar } from 'expo-status-bar'
import { images } from '../../constants'
import closeY from '../../assets/menu/close-yuan.png'
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import mime from 'mime';

export default function Create() {
    const { user } = useGlobalContext();
    const [form, setForm] = useState({ title: '' });
    const { pickImage, pickVideo } = usePickFile();
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const isImageSelected = imageFile?.uri != null;
    const isVideoSelected = videoFile?.uri != null;
    const [progress, setProgress] = useState({ type: '', percent: 0 });

    // 处理图片选择
    const handlePickImage = async () => {
        try {
            const result = await pickImage();

            if (!result) {
                // 用户可能取消了选择
                return;
            }

            console.log('handlePickImage result:', result);
            const { uri, name } = result;
            const fileInfo = await FileSystem.getInfoAsync(uri);
            const fileSize = fileInfo.size;
            let mimeType;
            if (fileInfo.exists) {
                mimeType = mime.getType(uri);
                console.log(`File MIME type: ${mimeType}`);

            }
            const fileModel = { uri, name, type: mimeType, size: fileSize }

            setImageFile(fileModel);

        } catch (err) {
            console.log('Image selection failed:', err);
            Alert.alert('Error', 'There was an error selecting the image');
        }
    };

    const handlePickVideo = async () => {
        try {
            const result = await pickVideo();

            if (!result) {
                // 用户可能取消了选择
                return;
            }

            console.log('handlePickVideo result:', result);
            setVideoFile(result);

        } catch (err) {
            console.log('Video selection failed:', err);
            Alert.alert('Error', 'There was an error selecting the video');
        }
    };

    // 生成视频缩略图
    const generateThumbnailFromVideo = async () => {
        if (!videoFile || !videoFile?.uri) {
            Alert.alert('Please select a video first');
            return;
        }

        console.log('videoFile:', videoFile);
        console.log('videoFile.uri:', videoFile?.uri);

        try {
            const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
                videoFile.uri,
                {
                    time: 0, // 获取视频的第一帧
                    quality: 1
                }
            );

            const fileInfo = await FileSystem.getInfoAsync(thumbnailUri);
            const fileSize = fileInfo.size;
            console.log('Thumbnail URI:', thumbnailUri);
            console.log('Thumbnail Size:', fileSize, 'bytes');

            setImageFile({ uri: thumbnailUri, name: 'thumbnail.jpg', type: 'image/jpeg', size: fileSize });

        } catch (err) {
            console.log('Failed to generate thumbnail:', err);
            Alert.alert('Error', 'There was an error generating the thumbnail');
        }
    };

    const handleUpload = async () => {
        setUploading(true);
        console.log('imageFile:', imageFile, '\n', 'videoFile', videoFile);
        try {
            if (form.title === '' || !isImageSelected || !isVideoSelected) {
                Alert.alert('Please fill in all required fields');
                setUploading(false);
                return;
            }

            // 上传文件
            const [imageUpload, videoUpload] = await Promise.all([
                useUploadFile(imageFile, setProgress, 'Image'),
                useUploadFile(videoFile, setProgress, 'Video'),
            ]);

            if (!imageUpload || !videoUpload) {
                throw new Error('One or more files failed to upload');
            }

            // 有时候可能因为网络的问题没有上传成功
            const { fileId: image_ID } = imageUpload;
            const { fileId: video_ID } = videoUpload;
            console.log(`image_ID: ${image_ID} \n video_ID: ${video_ID}`);

            // 获取数据库的图片和视频URI
            const StorageImageUrl = await fetchFileUrl(image_ID);
            const StorageVideoUrl = await fetchFileUrl(video_ID);
            console.log(`StorageImageUrl: ${StorageImageUrl} \n 'StorageVideoUrl:' ${StorageVideoUrl}`);


            const formData = {
                title: form.title,
                thumbnail: StorageImageUrl,
                video: StorageVideoUrl,
                creator: user.$id,
                image_ID,                     // 存储 image_ID
                video_ID,                     // 存储 video_ID
            }
            // 修改这里URI为从数据库获取
            const videoResult = await uploadData(formData);

            Alert.alert('Upload Success !')
            console.log('Upload Success  videoResult:', JSON.stringify(videoResult, null, 2));

            setForm({ title: '' });
            setImageFile(null);
            setVideoFile(null);
        } catch (e) {
            console.error("Upload Failed", e);
            Alert.alert('File upload failed', 'Please try again.');
        } finally {
            setUploading(false);
            setProgress({ type: '', percent: 0 });
        }
    };

    const handleCancelSelected = (type) => {
        if (type === 'image') {
            setImageFile(null);
        } else if (type === 'video') {
            setVideoFile(null);
            // 同时清除缩略图
            setImageFile(null);
        }
    };

    return (
        <SafeAreaView className='bg-primary h-full px-4 '>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/* Upload Video */}
                <View className='flex-row justify-between items-center mt-10 h-[60px]'>
                    <Text className='text-white text-2xl font-psemibold'>Upload Video</Text>
                    <Image
                        source={images.logoSmall}
                        className='w-9 h-10'
                        resizeMode='contain'
                    />
                </View>

                <CustomForm
                    title={'Title'}
                    handleChangeText={(text) => setForm({ ...form, title: text })}
                    value={form.title}
                    placeholder={'Catchy titles get more clicks !'}
                />

                {/* Upload Video */}
                <Text className='text-gray-100 mt-5 text-lg'>Video</Text>
                {/* TODO：视频存在则显示视频 */}
                {!isVideoSelected ? (
                    <TouchableOpacity onPress={handlePickVideo}>
                        <View className='w-full h-44 bg-[#1e1e2d] rounded-2xl mt-2 justify-center items-center'>
                            <View className='w-14 h-14 border border-dashed border-secondary-100
                                                justify-center items-center'>
                                <Image
                                    source={icons.upload}
                                    className='w-1/2 h-1/2'
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View className='w-full h-56 bg-[#1e1e2d] rounded-2xl mt-2 justify-center items-center relative'>
                        <Video
                            source={{ uri: videoFile?.uri }}
                            className='w-full h-full rounded-xl'
                            resizeMode={ResizeMode.COVER}
                            useNativeControls={true}
                        />
                        <TouchableOpacity
                            onPress={() => handleCancelSelected('video')}
                            className='absolute top-0 right-0 z-10 w-16 h-16 justify-center items-center'
                        >
                            <Image
                                source={closeY}
                                className='w-8 h-8'
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Thumbnail Image */}
                <Text className='text-gray-100 mt-5 text-lg'>Thumbnail</Text>
                {/* TODO：图片存在则显示图片 */}
                {!isImageSelected ? (
                    <View className='flex-row w-full justify-around mt-6 mb-8'>
                        <TouchableOpacity onPress={handlePickImage}>
                            <View className='w-36 h-16 bg-[#5454eb] rounded-3xl  flex-row justify-center items-center px-4'>
                                <Text className='text-white'>Choose File</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={generateThumbnailFromVideo}>
                            <View className='w-36 h-16 bg-[#517ae1] rounded-3xl  flex-row justify-center items-center px-4'>
                                <Text className='text-white'>Auto Generate</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className='w-full h-56 bg-[#1e1e2d] rounded-2xl mt-2 mb-8 flex-row justify-center items-center overflow-hidden relative'>
                        <Image
                            source={{ uri: imageFile?.uri }}
                            className='w-full h-full'
                            resizeMode='cover'
                        />
                        <TouchableOpacity
                            onPress={() => handleCancelSelected('image')}
                            className='absolute top-0 right-0 z-10 w-16 h-16 justify-center items-center'
                        >
                            <Image
                                source={closeY}
                                className='w-8 h-8'
                            />
                        </TouchableOpacity>
                    </View>
                )}


                {uploading ? (
                    <View className="w-full h-20 justify-center items-center bg-primary mb-4">

                        {progress.type !== 'Video' ? (
                            <>
                                <ActivityIndicator size="small" color="#ffffff" />
                                <Text className='text-white text-xl text-center mt-2'>
                                    Image Uploading
                                </Text>
                            </>
                        ) : (
                            <>
                                <Progress.Bar
                                    color="#02C2CC" unfilledColor='#fff'
                                    progress={progress.percent / 100} width={230} borderWidth={1}
                                />
                                <Text className=' text-white text-xl text-center mt-2'>
                                    {progress.percent} %
                                </Text>
                            </>
                        )}

                    </View>
                ) : false}

                {/* submit button */}
                <CustomButton
                    onPress={() => { handleUpload() }}
                    title={'Submit & Publish'}
                    style={'h-16 mb-8'}
                    textStyle={'text-black-100'}
                    isLoading={uploading}
                />
            </ScrollView>
            <StatusBar style='light' />
        </SafeAreaView>
    )
}