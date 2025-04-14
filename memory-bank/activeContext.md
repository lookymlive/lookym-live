# Active Context: LOOKYM

## Current Focus

Implementing the **Video Upload** feature within the **Video System**. Focus is currently on integrating the Cloudinary upload process with the UI and preparing data for Supabase.

## Recent Changes

- **User/AI Collab:** Verified Supabase `handle_new_user` trigger functionality.
- **User/AI Collab:** Set up Cloudinary credentials (`Cloud Name`, `Unsigned Upload Preset`) in `.env.local`.
- **AI Action:** Added `create.tsx` screen accessible via '+' tab, with role check for 'business' users.
- **AI Action:** Installed `expo-image-picker` and `expo-video` (migrated from `expo-av`).
- **AI Action:** Added video selection logic (`pickVideo`) and preview using `VideoView`.
- **User/AI Collab:** Debugged layout issues using `ScrollView` to ensure all components are visible.
- **AI Action:** Created `utils/cloudinary.ts` with `uploadVideoToCloudinary` function.
- **AI Action:** Integrated Cloudinary upload into `handleUpload` in `create.tsx`, including loading state/overlay.
- **AI Action:** Added `TextInput` components for `caption` and `hashtags` with state management and basic validation.
- **AI Action:** Corrected `expo-image-picker` `mediaTypes` usage based on latest docs.

## Next Steps

1.**Implement Supabase Integration:** Modify `handleUpload` in `create.tsx` to insert video metadata (Cloudinary URL, user ID, caption, hashtags) into the `public.videos` table after successful Cloudinary upload.
2.  **Refine UI/UX:** Improve styling, add better loading/error feedback if needed.
3.  **Implement Video Recording:** Add functionality to the "Grabar Video" button using `expo-camera`.
4.  Proceed with other **Video System** features (Player, Feed, Interactions, Detail Screen).

## Active Considerations

- Need to define the exact data structure and call for inserting video metadata into the Supabase `public.videos` table.
- Progress tracking for large video uploads might be needed later.
- Implementation of the "Grabar Video" functionality is pending.
