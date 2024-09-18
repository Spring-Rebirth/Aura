import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Bookmark() {
    return (
        <SafeAreaView className='bg-primary h-full items-center'>
            <Text className='text-white text-2xl'>Bookmark</Text>
        </SafeAreaView>
    )
}