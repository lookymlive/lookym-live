module.exports = {
  expo: {
    name: "LOOKYM",
    slug: "lookym",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "lookym",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.lookym",
      infoPlist: {
        NSCameraUsageDescription: "LOOKYM needs access to your camera to let you record videos.",
        NSMicrophoneUsageDescription: "LOOKYM needs access to your microphone to record audio for your videos.",
        NSPhotoLibraryUsageDescription: "LOOKYM needs access to your photo library to let you select videos to upload."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.yourcompany.lookym",
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/images/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      [
        "expo-image-picker",
        {
          "photosPermission": "LOOKYM needs access to your photos to let you select videos to upload.",
          "cameraPermission": "LOOKYM needs access to your camera to let you record videos."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "LOOKYM needs access to your camera to let you record videos."
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "LOOKYM needs access to your media library to save your videos.",
          "savePhotosPermission": "LOOKYM needs access to save videos to your media library.",
          "isAccessMediaLocationEnabled": true
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "your-eas-project-id"
      },
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
      cloudinaryApiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY,
      cloudinaryUploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    }
  }
};