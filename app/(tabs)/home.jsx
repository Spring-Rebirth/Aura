//cSpell:words psemibold appwrite
import { View, Text, FlatList, Image, RefreshControl, ActivityIndicator, Alert, Dimensions } from 'react-native'
import { useEffect, useState } from 'react'

import { images } from '../../constants'
import SearchInput from '../../components/SearchInput'
import Trending from "../../components/Trending"
import EmptyState from '../../components/EmptyState'
import CustomButton from '../../components/CustomButton'
import VideoCard from '../../components/VideoCard'
import useGetData from '../../hooks/useGetData'
import { useGlobalContext } from '../../context/GlobalProvider'
import { StatusBar } from 'expo-status-bar'
import { updateSavedVideo } from '../../lib/appwrite'

export default function Home() {
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [popularData, setPopularData] = useState([]);
	const { user } = useGlobalContext();
	const { fetchPosts, fetchPopularPosts } = useGetData({ setLoading, setData, setPopularData });
	const [currentPlayingPost, setCurrentPlayingPost] = useState(null);

	const toggleFullscreen = (fullscreen) => {
		setIsFullscreen(fullscreen);
	};

	const handleRefresh = () => {
		setRefreshing(true);
		fetchPosts();
		fetchPopularPosts();
		setRefreshing(false);
		console.log('user.favorite:', user.favorite);
	}

	const [isFullscreen, setIsFullscreen] = useState(false);


	useEffect(() => {
		const fetchDataAndUpdateVideo = async () => {
			setLoading(true); // 开始加载

			try {
				// 获取用户信息，更新收藏视频
				const { favorite } = user;
				await updateSavedVideo(user.$id, { favorite });

				// 并行请求 fetchPosts 和 fetchPopularPosts
				await Promise.all([fetchPosts(), fetchPopularPosts()]);

			} catch (error) {
				console.error(error);  // 处理错误
			} finally {
				setLoading(false);  // 请求完成后设置 loading 为 false
			}
		};

		fetchDataAndUpdateVideo();  // 调用异步函数		
	}, [user]);


	return (
		<View className={`flex-1 bg-primary ${isFullscreen ? 'w-full h-full' : 'h-full'}`}>
			{/* 在全屏模式下，不渲染其他内容，只渲染全屏视频 */}
			{isFullscreen ? (

				<VideoCard
					post={currentPlayingPost}
					handleRefresh={handleRefresh}
					isFullscreen={isFullscreen}
					toggleFullscreen={toggleFullscreen}
				/>
			) : (
				<>
					<FlatList
						data={loading ? [] : data}
						keyExtractor={(item) => item.$id}
						ListHeaderComponent={() => {
							return (
								<View className='my-6 px-4'>

									<View className='flex-row justify-between items-center mt-4 h-[60px]'>
										<View >
											<Text className='text-gray-100 text-lg'>Welcome Back</Text>
											<Text className='text-white text-2xl font-psemibold '>{user?.username}</Text>
										</View>
										<Image
											source={images.logoSmall}
											className='w-9 h-10'
											resizeMode='contain'
										/>
									</View>

									<SearchInput containerStyle={'mt-6'} />

									<View className='mt-8'>
										<Text className=' mb-4 font-psemibold text-lg text-sky-300'>Most Saved Videos</Text>
										{/* 头部视频 */}
										{popularData.length === 0 ? (
											<View className='items-center'>
												<Image
													source={images.empty}
													className='w-[75px] h-[60px]'
													resizeMode='contain'
												/>
												<Text className='text-sky-300 text-center font-psemibold'>
													Save the video to help it {'\n'}become a popular one !
												</Text>
											</View>
										) : (
											<Trending video={popularData} loading={loading} />
										)}

									</View>
									<Text className='text-white mt-10 font-psemibold text-lg text-center'> Latest Released Videos</Text>
								</View>

							);
						}}

						renderItem={({ item }) => {
							return (
								<VideoCard post={item} handleRefresh={handleRefresh} isFullscreen={isFullscreen}
									toggleFullscreen={toggleFullscreen} setCurrentPlayingPost={setCurrentPlayingPost}
								/>
							)
						}}
						ListEmptyComponent={() => {
							return loading ? (
								<View className="flex-1 justify-center items-center bg-primary mt-64">
									<ActivityIndicator size="large" color="#ffffff" />
									<Text className='mt-[10] text-white text-xl'>Loading, please wait...</Text>
								</View>
							) : (
								<View>
									<EmptyState />
									<CustomButton
										title={'Create Video'}
										textStyle={'text-black'}
										style={'h-16 my-5 mx-4'}
										onPress={() => router.push('/create')}
									/>
								</View>
							);
						}}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
						}
					/>

					<StatusBar style='light' hidden={true} />
				</>
			)}
		</View>
	)
}