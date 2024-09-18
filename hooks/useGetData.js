import { Alert } from 'react-native';
import { getAllPosts, getLatestPosts, searchPosts } from '../lib/appwrite';

function useGetData({ setData, setLoading, setLatestData, setQueryData }) {

    // 通用的数据获取函数
    const fetchData = async (fetchFunction, setState, errorMessage) => {
        try {
            setLoading(true);
            const res = await fetchFunction();
            setState(res);
        } catch (error) {
            Alert.alert(`Failed to load ${errorMessage} data`, error.message);
        } finally {
            setLoading(false);
        }
    };

    // 获取所有 posts
    const fetchPosts = () => fetchData(getAllPosts, setData, 'posts');

    // 获取最新 posts
    const fetchLatestPosts = () => fetchData(getLatestPosts, setLatestData, 'latest');

    // 搜索 posts
    const fetchQueryPosts = (queryText) => fetchData(() => searchPosts(queryText), setQueryData, 'query');

    return { fetchPosts, fetchLatestPosts, fetchQueryPosts };
}

export default useGetData;
