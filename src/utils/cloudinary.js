
//  Cloudinary Image Upload Utility
 

export const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "levelup_preset");
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dyszupync";
    formData.append("cloud_name", cloudName);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );
        
        const data = await response.json();
        
        if (data.secure_url) {
            return data.secure_url;
        }
        
        throw new Error(data.error?.message || "Cloudinary upload failed");
    } catch (err) {
        console.error("Cloudinary Utility Error:", err);
        throw err;
    }
};
