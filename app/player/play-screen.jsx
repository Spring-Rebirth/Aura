import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from "expo-router";

export default function PlayScreen() {
    const { post } = useLocalSearchParams();
    const parsedPost = post ? JSON.parse(post) : null;

    console.log('PlayScreen - post:', JSON.stringify(parsedPost, null, 4));

    return (
        <View>
            <Text className="mt-10 text-3xl">PlayScreen</Text>
        </View>
    )
}