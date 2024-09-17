import { Alert } from 'react-native';
import { getAllPosts, getLatestPosts, searchPosts } from '../lib/appwrite'

function useGetData({ setData, setLoading, setLatestData, setQueryData }) {

    const fetchPosts = () => {
        setLoading(true);
        getAllPosts()
            .then((res) => {
                setData(res);
            })
            .catch((error) => {
                Alert.alert('Failed to load data', error.message)
            })
            .finally(() => {
                setLoading(false);
            })
    }

    const fetchLatestPosts = () => {
        setLoading(true);
        getLatestPosts()
            .then((res) => {
                setLatestData(res);
            })
            .catch((error) => {
                Alert.alert('Failed to load Latest data', error.message)
            })
            .finally(() => {
                setLoading(false);
            })
    }

    const fetchQueryPosts = (queryText) => {
        setLoading(true);
        searchPosts(queryText)
            .then((res) => {
                setQueryData(res);
            })
            .catch((error) => {
                Alert.alert('Failed to load Query data', error.message)
            })
            .finally(() => {
                setLoading(false);
            })
    }


    return { fetchPosts, fetchLatestPosts, fetchQueryPosts }
}

export default useGetData;
