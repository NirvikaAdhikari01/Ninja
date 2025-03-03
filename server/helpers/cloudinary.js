const cloudinary = require("cloudinary").v2;
const fileType = require('file-type');
//configure with env data
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading to cloudinary");
  }
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
    throw new Error("failed to delete assest from cloudinary");
  }
};
// For uploading instructor profile images and videos
// For uploading instructor profile images and videos
const uploadInstructorProfileToCloudinary = async (file, resourceType) => {
  try {
    // Check for valid file buffer
    if (!file || !file.buffer) {
      throw new Error("No file or buffer found");
    }

    // Convert ArrayBuffer to Buffer if necessary
    const fileBuffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);

    // Log for debugging
    console.log("Received file mimetype:", file.mimetype);
    console.log("File buffer type:", fileBuffer.constructor.name); // Should be 'Buffer'

    // Convert the buffer to a stream
    const streamifier = require("streamifier");
    const stream = streamifier.createReadStream(fileBuffer);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            reject(new Error("Error uploading to Cloudinary"));
          } else {
            resolve(result);
          }
        }
      );

      stream.pipe(uploadStream); // Pipe the stream to Cloudinary
    });

    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message || error);
    throw error; // Re-throw the error to propagate it
  }
};






module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary,uploadInstructorProfileToCloudinary };
