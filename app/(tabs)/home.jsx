import { View, Text, FlatList, FlatListComponent, Image, RefreshControl } from 'react-native'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import SearchInput from '../../components/SearchInput'
import Trending from "../../components/Trending"
import EmptyState from '../../components/EmptyState'
import CustomButton from '../../components/CustomButton'

export default function Home() {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        // TODO : 获取数据并重新加载页面

    }

    return (
        <SafeAreaView className='bg-primary h-full'>
            <FlatList
                data={[{ id: '1' }, { id: '2' }]}

                // keyExtractor={}
                renderItem={({ item }) => {
                    return (
                        <Text className='text-white'>{item.id}</Text>

                    )
                }}
                ListHeaderComponent={() => {
                    return (
                        <View className='my-6 px-4'>

                            <View className='flex-row justify-between items-center'>
                                <View >
                                    <Text className='text-gray-100 text-lg'>Welcome Back</Text>
                                    <Text className='text-white text-2xl font-psemibold '>Myst Seed</Text>
                                </View>
                                <Image
                                    source={images.logoSmall}
                                    className='w-9 h-10'
                                    resizeMode='contain'
                                />
                            </View>
                            <SearchInput containerStyle={'mt-6'} />

                            <View className='mt-8'>
                                <Text className='text-white'>Trending Videos</Text>
                                <Trending />
                            </View>

                        </View>
                    );
                }}
                ListEmptyComponent={() => {
                    return (
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
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            />

        </SafeAreaView>
    )
}