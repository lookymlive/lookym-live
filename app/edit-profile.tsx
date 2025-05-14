import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '@/store/auth-store.ts';
import { useColorScheme } from '@/hooks/useColorScheme.ts';
import { router } from 'expo-router';

export default function EditProfileScreen() {
  const { currentUser, updateProfile } = useAuthStore();
  const { colors } = useColorScheme();
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [category, setCategory] = useState(currentUser?.category || '');
  const [location, setLocation] = useState(currentUser?.location || '');

  const handleSave = async () => {
    try {
      await updateProfile({ username, bio, category, location });
      Alert.alert('Perfil actualizado', 'Tu perfil ha sido actualizado.');
      router.back();
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.label, { color: colors.text }]}>Nombre de usuario</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={username}
        onChangeText={setUsername}
      />
      <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={bio}
        onChangeText={setBio}
      />
      <Text style={[styles.label, { color: colors.text }]}>Categoría (solo negocio)</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={category}
        onChangeText={setCategory}
      />
      <Text style={[styles.label, { color: colors.text }]}>Ubicación</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={location}
        onChangeText={setLocation}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  label: { fontSize: 16, marginTop: 16, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16 },
  button: { marginTop: 32, padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
