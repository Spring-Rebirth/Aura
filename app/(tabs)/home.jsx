//cSpell:words psemibold appwrite
import { View, Text, FlatList, Image, RefreshControl, ActivityIndicator, Alert } from 'react-native'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
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
	const [latestData, setLatestData] = useState([]);
	const { user, setUser } = useGlobalContext();
	const { fetchPosts, fetchLatestPosts } = useGetData({ setLoading, setData, setLatestData });

	const handleRefresh = () => {
		setRefreshing(true);
		fetchPosts();
		fetchLatestPosts();
		setRefreshing(false);
		console.log('user.favorite:', user.favorite);
	}

	const handleAddSaved = (videoId) => {
		if (!user.favorite.includes(videoId)) {
			// 深拷贝对象
			const newUser = JSON.parse(JSON.stringify(user));
			newUser.favorite.push(videoId);
			setUser(prev => ({
				...prev,
				favorite: newUser.favorite
			}))
			Alert.alert('Save successful');
		} else {
			Alert.alert('Already Saved this video');
		}
	}


	// console.log(`home-data: ${JSON.stringify(data, null, 2)}`);
	// 更新API updateSavedVideo()
	useEffect(() => {
		const { favorite } = user;
		updateSavedVideo(user.$id, { favorite });
	}, [user])


	useEffect(() => {
		fetchPosts();
		fetchLatestPosts();
	}, [])

	return (
		<SafeAreaView className='bg-primary h-full'>

			<FlatList
				data={loading ? [] : data}
				// item 是 data 数组中的每一项
				keyExtractor={(item) => item.$id}

				ListHeaderComponent={() => {
					return (
						<View className='my-6 px-4'>

							<View className='flex-row justify-between items-center'>
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
								<Text className='text-white mb-4'>Trending Videos</Text>
								{/* 头部视频 */}
								<Trending video={latestData} loading={loading} />
							</View>

						</View>
					);
				}}
				// renderItem 接受一个对象参数，通常解构为 { item, index, separators }
				renderItem={({ item }) => {
					return (
						<VideoCard post={item} handleAddSaved={handleAddSaved} handleRefresh={handleRefresh} />
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

			<StatusBar style='light' />
		</SafeAreaView>
	)
}