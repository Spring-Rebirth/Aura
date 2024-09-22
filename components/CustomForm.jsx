import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { icons } from '../constants'

export default function CustomForm({ title, handleChangeText, value = 'default' }) {
    const [showPassword, setShowPassword] = React.useState(false)
    return (
        <View className={`mt-4 space-y-2`}>
            <Text className={`text-gray-100 text-lg`}>{title}</Text>

            <View className='w-full h-16 bg-[#1e1e2d] border-2 border-black-200 rounded-2xl
                            focus:border-secondary relative'

            >

                <TextInput
                    className='w-full h-full px-4 text-white'
                    placeholder={`Enter your ${title}`}
                    placeholderTextColor='#7f7f7f'
                    style={{ outline: 'none' }}
                    secureTextEntry={(title === 'Password' || title === 'Confirm Password') && !showPassword}
                    value={value}
                    // Callback that is called when the text input's text changes. 
                    // Changed text is passed as a single string argument to the callback handler.
                    onChangeText={handleChangeText}
                />
                {/* Show password icon */}
                {
                    (title === 'Password' || title === 'Confirm Password')
                        ? (
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}
                                className='absolute right-4 top-4'
                            >
                                <Image
                                    source={showPassword ? icons.eye : icons.eyeHide}
                                    resizeMode='contain'
                                    className='w-6 h-6'
                                />
                            </TouchableOpacity>
                        )
                        : null
                }

            </View>
        </View>
    )
}