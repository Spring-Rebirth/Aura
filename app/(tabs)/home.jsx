import { View, Text, FlatList, FlatListComponent } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Home() {
    return (
        <SafeAreaView className='bg-primary h-full'>
            <FlatList
                data={[{ id: 1 }, { id: 2 }]}
                // keyExtractor={}
                renderItem={({ item }) => {
                    return (
                        <Text className='text-white'>{item.id}</Text>

                    )
                }}
                ListHeaderComponent={() => (
                    <View className='border-2 border-red-500 h-10'>
                        <Text className='text-white text-3xl'>Welcome Back</Text>
                    </View>
                )}
            />

        </SafeAreaView>
    )
}