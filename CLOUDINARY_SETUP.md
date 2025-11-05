# Cloudinary Image Upload Configuration Guide

This guide explains how to set up Cloudinary for image uploads in the LinkedSkill application.

## What is Cloudinary?

Cloudinary is a cloud-based image and video management service that provides image upload, storage, optimization, and delivery features.

## Benefits of Using Cloudinary

✅ **Cloud Storage**: No need to store images on your server
✅ **Automatic Optimization**: Images are automatically optimized for web delivery
✅ **CDN Delivery**: Fast image loading from global CDN
✅ **Image Transformations**: Resize, crop, and transform images on-the-fly
✅ **Free Tier**: 25GB storage and 25GB bandwidth per month

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click **Sign Up** for free
3. Choose the free plan (no credit card required)
4. Verify your email address

### 2. Get Your API Credentials

1. After logging in, go to your **Dashboard**
2. You'll see your credentials:
   - **Cloud Name**: Your unique cloud identifier
   - **API Key**: Your API key for authentication
   - **API Secret**: Your secret key (keep this private!)

### 3. Configure Your Application

1. Open `server/.env` file
2. Replace the placeholder values with your actual Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=linkedskill-demo
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1234
```

### 4. Restart Your Server

After updating the `.env` file, restart your backend server:

```bash
cd server
npm run dev
```

## How It Works

### Profile Photo Upload

1. Users hover over their profile picture
2. Click the camera icon to select an image
3. Image is uploaded to Cloudinary
4. The Cloudinary URL is saved to MongoDB
5. Old profile photos are automatically deleted from Cloudinary

### Class Thumbnail Upload

1. Experts can upload a thumbnail when creating a class
2. The thumbnail is displayed on class cards
3. If no thumbnail is uploaded, a default gradient icon is shown
4. Thumbnails are stored in Cloudinary under the `linkedskill/thumbnails` folder

## File Organization in Cloudinary

```
linkedskill/
├── profiles/          # User profile photos
│   ├── profile-123456789.jpg
│   └── profile-987654321.png
└── thumbnails/        # Class thumbnails
    ├── thumbnail-111222333.jpg
    └── thumbnail-444555666.webp
```

## Image Upload Limits

- **Max File Size**: 5MB per image
- **Supported Formats**: JPEG, JPG, PNG, GIF, WebP
- **Automatic Optimization**: Images are automatically compressed and optimized

## API Endpoints

### Upload Profile Photo
- **Method**: POST
- **Endpoint**: `/profile/upload-photo`
- **Body**: FormData with `photo` field
- **Auth**: Required

### Upload Class Thumbnail
- **Method**: POST
- **Endpoint**: `/classes/:id/upload-thumbnail`
- **Body**: FormData with `thumbnail` field
- **Auth**: Required (must be class owner)

## Troubleshooting

### Issue: "Invalid credentials" error

**Solution**: Double-check that your Cloudinary credentials in `.env` are correct.

### Issue: Images not uploading

**Solution**: 
1. Check your internet connection
2. Verify file size is under 5MB
3. Ensure file format is supported (JPEG, PNG, GIF, WebP)
4. Check server logs for specific error messages

### Issue: Old images not being deleted

**Solution**: This is usually not a problem - the deletion happens automatically. If you want to manually clean up, go to your Cloudinary dashboard and delete old images from the Media Library.

## Free Tier Limits

Cloudinary's free tier includes:
- ✅ 25GB storage
- ✅ 25GB monthly bandwidth
- ✅ 25,000 transformations per month
- ✅ All basic features

This is more than enough for development and small-scale production use.

## Security Notes

⚠️ **Never commit your API credentials to Git!**
- Keep your `.env` file in `.gitignore`
- Use environment variables in production
- Rotate your API secret if exposed

## Additional Resources

- 📚 [Cloudinary Documentation](https://cloudinary.com/documentation)
- 🎓 [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration)
- 💡 [Image Transformation Examples](https://cloudinary.com/documentation/image_transformations)

---

**Questions?** Check the Cloudinary documentation or contact support at [https://support.cloudinary.com](https://support.cloudinary.com)
