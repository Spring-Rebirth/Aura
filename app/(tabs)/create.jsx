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


export default function Create() {
    const { user } = useGlobalContext();
    const [form, setForm] = useState({
        title: '',
    });

    const [files, setFiles] = useState({
        image: { uri: '', name: '', mimeType: '' },
        video: { uri: '', name: '', mimeType: '' }
    });

    const isImageSelected = files.image.uri !== '';
    const isVideoSelected = files.video.uri !== '';
    const { pickImage, pickVideo } = usePickFile(setFiles);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);


    // 处理图片选择
    const handlePickImage = async () => {
        try {
            result = await pickImage();
            console.log('handlePickImage', result);
            setImageFile(result);
        } catch (err) {
            console.log('Image selection failed:', err);
            Alert.alert('Error', 'There was an error selecting the image');
        }
    };

    // 处理视频选择
    const handlePickVideo = async () => {
        try {
            result = await pickVideo();
            console.log('handlePickVideo:', result);
            setVideoFile(result);
        } catch (err) {
            console.log('Video selection failed:', err);
            Alert.alert('Error', 'There was an error selecting the video');
        }
    };

    const handleUpload = async () => {
        setUploading(true);
        console.log('imageFile:', imageFile, '\n', 'videoFile', videoFile);
        try {
            if (form.title === '' || !isImageSelected || !isVideoSelected) {
                Alert.alert('Something content is not fill');
                return;
            }
            // 上传文件

            const [imageUpload, videoUpload] = await Promise.all([
                useUploadFile(imageFile),
                useUploadFile(videoFile)
            ])

            if (!imageUpload || !videoUpload) {
                throw new Error('One or more files failed to upload');
            }

            // 有时候可能因为网络的问题没有上传成功
            const { fileId: imageId } = imageUpload;
            const { fileId: videoId } = videoUpload;
            console.log(`imageId: ${imageId} \n videoId: ${videoId}`);

            // 获取数据库的图片和视频URI
            const StorageImageUrl = await fetchFileUrl(imageId);
            const StorageVideoUrl = await fetchFileUrl(videoId);
            console.log(`StorageImageUrl: ${StorageImageUrl} \n 'StorageVideoUrl:' ${StorageVideoUrl}`);


            const formData = {
                title: form.title,
                prompt: form.prompt,
                thumbnail: StorageImageUrl,
                video: StorageVideoUrl,
                creator: user.$id,
                imageId,                     // 存储 imageId
                videoId,                     // 存储 videoId
            }
            // 修改这里URI为从数据库获取
            const videoResult = await uploadData(formData);

            Alert.alert('Upload Success !')
            console.log('Upload Success  videoResult:', JSON.stringify(videoResult, null, 2));


            setForm({ title: '', prompt: '' })
            setFiles({
                image: { uri: '', name: '', mimeType: '' },
                video: { uri: '', name: '', mimeType: '' }
            })
        } catch (e) {
            console.error("Upload Failed", e);
            Alert.alert('File upload failed', 'Please try again.');
        } finally {
            setUploading(false);
        }

    };

    const handleCancelSelected = (type) => {
        if (type === 'image') {
            setFiles(prev => ({ ...prev, image: { uri: '', name: '', mimeType: '' } }));
            setImageFile(null);
        } else if (type === 'video') {
            setFiles(prev => ({ ...prev, video: { uri: '', name: '', mimeType: '' } }));
            setVideoFile(null);
        }
    }

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
                            source={{ uri: files.video.uri }}
                            className='w-full h-full rounded-xl'
                            resizeMode={ResizeMode.COVER}

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
                    <TouchableOpacity onPress={handlePickImage}>
                        <View className='w-full h-16 bg-[#1e1e2d] rounded-2xl mt-2 flex-row justify-center items-center'>
                            <Image
                                source={icons.upload}
                                className='w-6 h-6'
                            />
                            <Text className='text-white ml-2'>Choose a file</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View className='w-full h-56 bg-[#1e1e2d] rounded-2xl mt-2 flex-row justify-center items-center overflow-hidden relative'>
                        <Image
                            source={{ uri: files.image.uri }}
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
                    <View className="w-full h-20 justify-center items-center bg-primary">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className='mt-[10] text-white text-xl'>Uploading, please wait...</Text>
                    </View>
                ) : false}

                {/* submit button */}
                <CustomButton
                    onPress={() => { handleUpload() }}
                    title={'Submit & Publish'}
                    style={'h-16 my-8'}
                    textStyle={'text-black-100'}
                    isLoading={uploading}
                />
            </ScrollView>
            <StatusBar style='light' />
        </SafeAreaView>
    )
}