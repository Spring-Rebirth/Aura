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
import { uploadData } from '../../lib/appwrite'
import { StatusBar } from 'expo-status-bar'

export default function Create() {
    const { user } = useGlobalContext();
    const [form, setForm] = useState({
        title: '',
        prompt: ''
    });

    const [files, setFiles] = useState({
        image: { uri: '', name: '', mimeType: '' },
        video: { uri: '', name: '', mimeType: '' }
    });

    const isImageSelected = files.image.uri !== '';
    const isVideoSelected = files.video.uri !== '';
    const { pickImage, pickVideo } = usePickFile(setFiles);
    const [imageFile, setImageFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [uploading, setUploading] = useState(false);


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
        console.log('imageFile:', imageFile, 'videoFile', videoFile);
        try {
            if (form.title === '' || form.prompt === '' || !isImageSelected || !isVideoSelected) {
                Alert.alert('Something content is not fill');
                return;
            }
            // 上传文件
            const imageResponse = await useUploadFile(imageFile);
            const videoResponse = await useUploadFile(videoFile);
            console.log('imageResponse | videoResponse', imageResponse, videoResponse);

            const formData = {
                title: form.title,
                prompt: form.prompt,
                thumbnail: files.image.uri,
                video: files.video.uri,
                creator: user.$id
            }
            await uploadData(formData);
            Alert.alert('Upload Success !')
            setForm({ title: '', prompt: '' })
            setFiles({
                image: { uri: '', name: '', mimeType: '' },
                video: { uri: '', name: '', mimeType: '' }
            })
        } catch (e) {
            console.error("Upload Failed", e);
        } finally {
            setUploading(false);
        }

    };


    return (
        <SafeAreaView className='bg-primary h-full px-6 '>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/* Upload Video */}
                <Text className='text-white text-2xl font-psemibold mt-10 '>Upload Video</Text>

                <CustomForm
                    title={'Video title'}
                    handleChangeText={(text) => setForm({ ...form, title: text })}
                    value={form.title}
                />

                {/* Upload Video */}
                <Text className='text-gray-100 mt-5 text-lg'>Upload Video</Text>
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
                    <View className='w-full h-60 bg-[#1e1e2d] rounded-2xl mt-2 justify-center items-center'>
                        <Video
                            // 参数格式待修改
                            source={{ uri: files.video.uri }}
                            className='w-full h-4/5 rounded-xl'
                            resizeMode={ResizeMode.CONTAIN}
                            useNativeControls
                            shouldPlay

                        />
                    </View>
                )}

                {/* Thumbnail Image */}
                <Text className='text-gray-100 mt-5 text-lg'>Thumbnail Image</Text>
                {/* TODO：图片存在则显示图片 */}
                <TouchableOpacity onPress={handlePickImage}>
                    {!isImageSelected ? (
                        <View className='w-full h-16 bg-[#1e1e2d] rounded-2xl mt-2 flex-row justify-center items-center'>
                            <Image
                                source={icons.upload}
                                className='w-6 h-6'
                            />
                            <Text className='text-white ml-2'>Choose a file</Text>
                        </View>
                    ) : (
                        <View className='w-full h-52 bg-[#1e1e2d] rounded-2xl mt-2 flex-row justify-center items-center overflow-hidden'>
                            <Image
                                source={{ uri: files.image.uri }}
                                className='w-4/5 h-4/5'
                                resizeMode='contain'
                            />
                        </View>
                    )}
                </TouchableOpacity>

                {/* AI Prompt */}
                <CustomForm
                    title={'AI prompt'}
                    handleChangeText={(text) => setForm({ ...form, prompt: text })}
                    value={form.prompt}
                />

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