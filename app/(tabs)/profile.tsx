import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { Settings, Grid3X3, Bookmark, ShoppingBag, Store, MapPin, Edit, LogOut, User, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { currentUser, logout, updateProfile } = useAuthStore();
  const { colors, isDark } = useColorScheme();
  const [activeTab, setActiveTab] = useState('posts');
  
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleEditProfile = () => {
    // In a real app, navigate to edit profile screen
    Alert.alert('Edit Profile', 'This would navigate to the edit profile screen');
  };
  
  const handleChangePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to grant access to your photos to change your profile picture.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // In a real app, upload the image to storage
        // For now, just update the user's avatar with the selected image URI
        await updateProfile({ avatar: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error changing photo:', error);
      Alert.alert('Error', 'Failed to change profile photo');
    }
  };
  
  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.notLoggedIn}>
          <Text style={[styles.notLoggedInText, { color: colors.text }]}>
            Please log in to view your profile
          </Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Mock data for profile stats
  const stats = {
    posts: 24,
    followers: 1250,
    following: 348,
  };
  
  // Mock data for posts
  const mockPosts = Array(12).fill(0).map((_, i) => ({
    id: `post-${i}`,
    imageUrl: `https://picsum.photos/500/500?random=${i}`,
  }));
  
  // Mock data for saved posts
  const mockSaved = Array(8).fill(0).map((_, i) => ({
    id: `saved-${i}`,
    imageUrl: `https://picsum.photos/500/500?random=${i + 100}`,
  }));
  
  // Business-specific mock data
  const businessInfo = {
    category: 'Fashion & Apparel',
    location: 'New York, NY',
    website: 'www.lookym-business.com',
    hours: 'Mon-Fri: 9AM-6PM',
  };
  
  // Render different content based on user role
  const renderRoleSpecificContent = () => {
    if (currentUser.role === 'business') {
      return (
        <View style={styles.businessInfo}>
          <View style={styles.businessInfoItem}>
            <Store size={16} color={colors.textSecondary} />
            <Text style={[styles.businessInfoText, { color: colors.textSecondary }]}>
              {businessInfo.category}
            </Text>
          </View>
          
          <View style={styles.businessInfoItem}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={[styles.businessInfoText, { color: colors.textSecondary }]}>
              {businessInfo.location}
            </Text>
          </View>
          
          <TouchableOpacity style={[styles.businessButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.businessButtonText, { color: colors.text }]}>
              Business Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };
  
  // Render different tabs based on user role
  const renderTabs = () => {
    const tabs = [
      { id: 'posts', icon: <Grid3X3 size={24} color={activeTab === 'posts' ? colors.primary : colors.textSecondary} /> },
      { id: 'saved', icon: <Bookmark size={24} color={activeTab === 'saved' ? colors.primary : colors.textSecondary} /> },
    ];
    
    // Add business-specific tabs
    if (currentUser.role === 'business') {
      tabs.push({ 
        id: 'products', 
        icon: <ShoppingBag size={24} color={activeTab === 'products' ? colors.primary : colors.textSecondary} /> 
      });
    }
    
    return (
      <View style={[styles.tabs, { borderColor: colors.border }]}>
        {tabs.map(tab => (
          <TouchableOpacity 
            key={tab.id}
            style={[
              styles.tab, 
              activeTab === tab.id && [styles.activeTab, { borderColor: colors.primary }]
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            {tab.icon}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <View style={styles.postsGrid}>
            {mockPosts.map(post => (
              <TouchableOpacity key={post.id} style={styles.postItem}>
                <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'saved':
        return (
          <View style={styles.postsGrid}>
            {mockSaved.map(post => (
              <TouchableOpacity key={post.id} style={styles.postItem}>
                <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'products':
        return (
          <View style={styles.productsContainer}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              You haven't added any products yet
            </Text>
            <TouchableOpacity 
              style={[styles.addProductButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.addProductButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.username, { color: colors.text }]}>{currentUser.username}</Text>
        <TouchableOpacity onPress={() => router.push('./settings')}>
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: currentUser.avatar }} 
                style={styles.avatar} 
              />
              <TouchableOpacity 
                style={[styles.changePhotoButton, { backgroundColor: colors.primary }]}
                onPress={handleChangePhoto}
              >
                <Camera size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.posts}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.followers}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.text }]}>{stats.following}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.displayName, { color: colors.text }]}>
              {currentUser.displayName}
              {currentUser.verified && ' ✓'}
            </Text>
            
            <Text style={[styles.userRole, { color: colors.primary }]}>
              {currentUser.role === 'business' ? 'Business Account' : 'Personal Account'}
            </Text>
            
            <Text style={[styles.bio, { color: colors.textSecondary }]}>
              {currentUser.bio || 'No bio yet'}
            </Text>
            
            {renderRoleSpecificContent()}
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleEditProfile}
            >
              <Edit size={16} color={colors.text} style={styles.actionButtonIcon} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleLogout}
            >
              <LogOut size={16} color={colors.text} style={styles.actionButtonIcon} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {renderTabs()}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSection: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginLeft: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  profileInfo: {
    marginBottom: 16,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    marginBottom: 8,
  },
  businessInfo: {
    marginTop: 8,
  },
  businessInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  businessInfoText: {
    fontSize: 14,
    marginLeft: 6,
  },
  businessButton: {
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  businessButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
    flexDirection: 'row',
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  postItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  productsContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  addProductButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addProductButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notLoggedInText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});