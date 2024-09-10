import { TouchableOpacity, Text } from "react-native";

// cSpell:word psemibold
export default function CustomButton({ onPress, title, style, textStyle, isLoading }) {
    return (
        <TouchableOpacity
            title={title}
            activeOpacity={0.7}
            onPress={onPress}
            disabled={isLoading}
            className={`bg-secondary justify-center items-center rounded-xl 
                        ${isLoading ? 'opacity-50' : ''} ${style}`}
        >
            <Text className={`text-white text-center text-lg font-psemibold ${textStyle}`}>
                {title}
            </Text>
        </TouchableOpacity>
    )
}