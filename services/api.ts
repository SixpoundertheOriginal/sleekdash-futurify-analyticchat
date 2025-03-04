import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data; // Returns the JSON response from Flask
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};
