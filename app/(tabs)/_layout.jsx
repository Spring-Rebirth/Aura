import { View, Text, Image } from 'react-native'
import { Tabs } from 'expo-router'
import icons from '../../constants/icons'
import { useWindowDimensions } from 'react-native'

function TabIcon({ name, icon, color, focused }) {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    return (
        <View className='justify-center items-center gap-1.5'>
            <Image
                source={icon}
                resizeMode='contain'
                tintColor={color}
                className='w-6 h-6'
            />
            {/* //cSpell:disable-next-line */}
            {!isLandscape && (
                <Text
                    style={{ color: color }}
                    className={`text-xs ${focused ? 'font-psemibold' : 'font-pregular'}`}
                    numberOfLines={1}
                    ellipsizeMode={'clip'}
                >
                    {name}
                </Text>
            )}
        </View >
    )
}

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{
            tabBarShowLabel: false,
            tabBarActiveTintColor: '#FFA001',
            tabBarInactiveTintColor: '#CDCDE0',
            tabBarStyle: {
                backgroundColor: '#161622',
                borderTopWidth: 1,
                borderTopColor: '#1E1E2A',
                height: 60
            }
        }}>
            <Tabs.Screen
                name='home'
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon
                            name={'Home'}
                            icon={icons.home}
                            color={color}
                            focused={focused} />
                    )
                }}
            />
            <Tabs.Screen
                name='create'
                options={{
                    title: 'Create',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon
                            name={'Create'}
                            icon={icons.plus}
                            color={color}
                            focused={focused} />
                    )
                }}
            />
            <Tabs.Screen
                name='saved'
                options={{
                    title: 'Saved',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon
                            name={'Saved'}
                            icon={icons.bookmark}
                            color={color}
                            focused={focused} />
                    )
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon
                            name={'Profile'}
                            icon={icons.profile}
                            color={color}
                            focused={focused} />
                    )
                }}
            />

        </Tabs>
    )
}