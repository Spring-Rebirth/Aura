import React from 'react'
import { FlatList, Text, View } from 'react-native'

export default function Trending({ }) {
    return (
        <FlatList
            horizontal
            className=''
            data={[{ id: '1' }, { id: '2' }]}
            renderItem={({ item }) => (
                <View >
                    <Text className='text-white m-2'>{item.id}</Text>
                </View>
            )}
        />
    )
}
