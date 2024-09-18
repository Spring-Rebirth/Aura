import { useState, useEffect } from 'react'
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomForm from '../../components/CustomForm'
import CustomButton from '../../components/CustomButton'
import { icons } from '../../constants'
import { usePickFile } from '../../hooks/usePickFile'
import { ResizeMode, Video } from 'expo-av'

export default function Create() {
    const [form, setForm] = useState({
        title: '',
        prompt: ''
    });
    const [files, setFiles] = useState({
        image: null,
        video: null
    });

    const { pickImage, pickVideo } = usePickFile(setFiles);

    // 处理图片选择
    const handlePickImage = async () => {
        try {
            await pickImage();
            // console.log(files.image);
        } catch (err) {
            console.log('Image selection failed:', err);
            Alert.alert('Error', 'There was an error selecting the image');
        }
    };

    // 处理视频选择
    const handlePickVideo = async () => {
        try {
            await pickVideo();
            // console.log(files.video);
        } catch (err) {
            console.log('Video selection failed:', err);
            Alert.alert('Error', 'There was an error selecting the video');
        }
    };

    // 检查状态更新
    useEffect(() => {
        if (files.image) {
            console.log('Image file:', files.image);
        }
    }, [files.image]);

    useEffect(() => {
        if (files.video) {
            console.log('Video file:', files.video);
        }
    }, [files.video]);


    return (
        <SafeAreaView className='bg-primary h-full px-6 justify-center'>
            <ScrollView>
                {/* Upload Video */}
                <Text className='text-white text-2xl font-psemibold '>Upload Video</Text>
                <CustomForm
                    title={'Video title'}
                    handleChangeText={(text) => setForm({ ...form, title: text })}
                />

                {/* Upload Video */}
                <Text className='text-gray-100 mt-5 text-lg'>Upload Video</Text>
                {/* TODO：视频存在则显示视频 */}
                {!files.video ? (
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
                    <View className='w-full h-44 bg-[#1e1e2d] rounded-2xl mt-2 justify-center items-center'>
                        <Video
                            // 参数格式待修改
                            source={{ uri: files.video.assets[0].uri }}
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
                    {!files.image ? (
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
                                source={{ uri: files.image.assets[0].uri }}
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
                />

                {/* submit button */}
                <CustomButton
                    onPress={() => { }}
                    title={'Submit & Publish'}
                    style={'h-16 mt-8'}
                    textStyle={'text-black-100'}
                    isLoading={false}
                />
            </ScrollView>
        </SafeAreaView>
    )
}