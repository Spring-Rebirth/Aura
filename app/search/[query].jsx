//cSpell:words psemibold appwrite
import { View, Text, FlatList, Image, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import SearchInput from '../../components/SearchInput'
import EmptyState from '../../components/EmptyState'
import CustomButton from '../../components/CustomButton'
import VideoCard from '../../components/VideoCard'
import useGetData from '../../hooks/useGetData'
import { useLocalSearchParams } from 'expo-router'

export default function Search() {
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [queryData, setQueryData] = useState([]);
    const { fetchQueryPosts } = useGetData({ setLoading, setQueryData });
    const { query } = useLocalSearchParams();

    const handleRefresh = () => {
        setRefreshing(true);
        fetchQueryPosts(query);
        setRefreshing(false);
    }

    useEffect(() => {
        fetchQueryPosts(query);
    }, [query])

    return (
        <SafeAreaView className='bg-primary h-full'>

            <FlatList
                data={loading ? [] : queryData}
                // item 是 data 数组中的每一项
                keyExtractor={(item) => item.$id}

                ListHeaderComponent={() => {
                    return (
                        <View className='my-6 px-4'>

                            <View className='flex-row justify-between items-center'>
                                <View >
                                    <Text className='text-gray-100 text-lg'>Search Result</Text>
                                    <Text className='text-white text-2xl font-psemibold '>{query}</Text>
                                </View>
                                <Image
                                    source={images.logoSmall}
                                    className='w-9 h-10'
                                    resizeMode='contain'
                                />
                            </View>

                            <SearchInput containerStyle={'mt-6'} />

                        </View>
                    );
                }}
                // renderItem 接受一个对象参数，通常解构为 { item, index, separators }
                renderItem={({ item }) => {
                    return (
                        <VideoCard video={item} />
                    )
                }}
                ListEmptyComponent={() => {
                    return loading ? (
                        <View className="flex-1 justify-center items-center bg-primary">
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
                            />
                        </View>
                    );
                }}

            />




        </SafeAreaView>
    )
}