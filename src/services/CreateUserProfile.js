import { generateClient } from 'aws-amplify/api';
import { getUserProfile } from '../graphql/queries';
import { createUserProfile } from '../graphql/mutations';

const client = generateClient();

export async function ensureUserProfile(user) {
  if (!user?.userId || !user?.username) {
    console.error("Usuario inválido para crear perfil:", user);
    return null;
  }

  try {
    // 1. Verificar si ya existe
    const existing = await client.graphql({
      query: getUserProfile,
      variables: { id: user.userId }
    });

    if (existing?.data?.getUserProfile) {
      return existing.data.getUserProfile;
    }

    // 2. Crear si no existe
    const profile = await client.graphql({
      query: createUserProfile,
      variables: {
        input: {
          id: user.userId,
          username: user.username
        }
      }
    });

    return profile.data.createUserProfile;

  } catch (error) {
    console.error("Error asegurando UserProfile:", error);
    return null;
  }
}
