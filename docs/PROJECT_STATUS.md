# Project Status & Development Guide for LOOKYM

## Project Purpose

LOOKYM is a mobile-first platform connecting users and businesses through short-form video content. Businesses showcase their storefronts and products, while users discover, interact, and communicate directly with them.

---

## Current State (as of 2025-04-14)

### What Works

- **Project Setup:** React Native/Expo, TypeScript, modular structure
- **Navigation:** Expo Router
- **State Management:** Zustand with persistence
- **Authentication:** Supabase Auth, login/registration screens, user/business roles, session persistence
- **Chat:** Basic chat UI and state
- **Database:** Supabase schema and triggers are working
- **Video Upload (Partial):**
  - Cloudinary integration complete
  - Video selection and preview implemented
  - Upload to Cloudinary from client works
  - UI for caption/hashtags present
