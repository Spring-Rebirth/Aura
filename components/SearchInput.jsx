import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { icons } from '../constants'

export default function SearchInput({ title, handleChangeText, containerStyle }) {

    return (
        <View className={`w-full h-16 bg-[#1e1e2d] border-2 border-black-200 rounded-2xl \
                        focus:border-secondary relative flex-row items-center ${containerStyle}`}
        >
            <TextInput
                className='flex-1 h-full px-4 text-white'
                placeholder={`Search for a video topic`}
                placeholderTextColor='#7f7f7f'
                style={{ outline: 'none' }}
                secureTextEntry={title === 'Password' && !showPassword}

                // Callback that is called when the text input's text changes. 
                // Changed text is passed as a single string argument to the callback handler.
                onChangeText={handleChangeText}
            />

            <TouchableOpacity className='mr-4'>
                <Image
                    source={icons.search}
                    className='w-5 h-5'
                />

            </TouchableOpacity>
        </View>

    )
}