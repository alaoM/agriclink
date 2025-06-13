import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to store data with a timestamp
export const storeDataWithExpiration = async (key, value) => {
    const twoDaysInMilliseconds = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
    const dataWithTimestamp = {
        value,
        timestamp: Date.now(),
        ttl: twoDaysInMilliseconds, // set expiration time to 2 days
    };
    try {
        await AsyncStorage.setItem(key, JSON.stringify(dataWithTimestamp));
    } catch (error) {
        console.error('Error storing data', error);
    }
};

// Function to retrieve data and check if it's expired
export const getDataWithExpiration = async (key) => {
    try {
        const jsonData = await AsyncStorage.getItem(key);
        if (jsonData !== null) {
            const data = JSON.parse(jsonData);
            const now = Date.now();

            // Check if the data is expired
            if (now - data.timestamp > data.ttl) {
                // Data is expired, remove it
                await AsyncStorage.removeItem(key);
                return null;
            }

            return data.value;
        }
    } catch (error) {
        console.error('Error retrieving data', error);
        return null;
    }
};

// Function to remove data manually (e.g., after login)
export const removeDataAfterLogin = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing data', error);
    }
};

// // Example Usage:

// // Set data with an expiration time of 2 days
// storeDataWithExpiration('accessToken', 'your-access-token-here');

// // Retrieve data (will check if expired)
// const token = await getDataWithExpiration('accessToken');
// if (token) {
//     console.log('Token is valid:', token);
// } else {
//     console.log('Token has expired or does not exist');
// }

// // Remove data after login
// removeDataAfterLogin('accessToken');
