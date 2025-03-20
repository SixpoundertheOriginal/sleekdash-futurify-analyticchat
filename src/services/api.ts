
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: "POST",
            body: formData,
        });
      
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to upload file: ${response.status} ${errorText}`);
        }
      
        return await response.json();
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// If you need to add messages to chat, export this function separately
export function addMessageToChat(sender: string, message: string) {
    // Your chat message handling logic here
}

// Function to handle Edge Function errors more gracefully
export function handleEdgeFunctionError(error: any): string {
    console.error('Edge Function error:', error);
    
    // Check if it's a standard error object
    if (error instanceof Error) {
        return error.message;
    }
    
    // Check if it's a response error with details
    if (error && typeof error === 'object') {
        if (error.message) {
            return error.message;
        }
        
        if (error.error && typeof error.error === 'object' && error.error.message) {
            return error.error.message;
        }
        
        if (error.statusText) {
            return `Server error: ${error.statusText}`;
        }
    }
    
    // Default generic error
    return 'An error occurred with the Edge Function. Please try again later.';
}
