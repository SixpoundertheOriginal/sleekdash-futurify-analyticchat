export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch("http://127.0.0.1:5000/api/analyze", {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error("Failed to upload file");
    }
  
    return response.json();
}

// If you need to add messages to chat, export this function separately
export function addMessageToChat(sender: string, message: string) {
    // Your chat message handling logic here
}