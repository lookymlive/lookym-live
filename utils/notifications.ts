import { supabase } from "./supabase.ts";

// Tipos de notificaciones soportados
export type NotificationType =
  | "new_follower"
  | "video_like"
  | "new_comment"
  | "new_message";
export type EntityType = "video" | "user" | "message" | "comment";

/**
 * Crea una nueva notificación en la base de datos
 * @param userId ID del usuario que recibirá la notificación
 * @param type Tipo de notificación
 * @param content Contenido descriptivo de la notificación
 * @param originUserId ID del usuario que originó la notificación (opcional)
 * @param relatedEntityId ID de la entidad relacionada (opcional)
 * @param relatedEntityType Tipo de la entidad relacionada (opcional)
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  content: string,
  originUserId?: string,
  relatedEntityId?: string,
  relatedEntityType?: EntityType
) => {
  try {
    const { data, error } = await supabase.from("notifications").insert([
      {
        user_id: userId,
        type,
        content,
        origin_user_id: originUserId,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType,
        read: false,
      },
    ]);

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error al crear notificación:", error.message);
    throw error;
  }
};

/**
 * Crea una notificación de nuevo seguidor
 * @param followedUserId ID del usuario que fue seguido
 * @param followerUserId ID del usuario que comenzó a seguir
 * @param followerUsername Nombre de usuario del seguidor
 */
export const createFollowNotification = async (
  followedUserId: string,
  followerUserId: string,
  followerUsername: string
) => {
  const content = `${followerUsername} ha comenzado a seguirte`;
  return createNotification(
    followedUserId,
    "new_follower",
    content,
    followerUserId,
    followerUserId,
    "user"
  );
};

/**
 * Crea una notificación de like en video
 * @param videoOwnerId ID del propietario del video
 * @param likerUserId ID del usuario que dio like
 * @param likerUsername Nombre de usuario que dio like
 * @param videoId ID del video
 */
export const createVideoLikeNotification = async (
  videoOwnerId: string,
  likerUserId: string,
  likerUsername: string,
  videoId: string
) => {
  const content = `A ${likerUsername} le ha gustado tu video`;
  return createNotification(
    videoOwnerId,
    "video_like",
    content,
    likerUserId,
    videoId,
    "video"
  );
};

/**
 * Crea una notificación de nuevo comentario
 * @param videoOwnerId ID del propietario del video
 * @param commenterUserId ID del usuario que comentó
 * @param commenterUsername Nombre de usuario que comentó
 * @param videoId ID del video
 * @param commentId ID del comentario
 */
export const createCommentNotification = async (
  videoOwnerId: string,
  commenterUserId: string,
  commenterUsername: string,
  videoId: string,
  commentId: string
) => {
  const content = `${commenterUsername} ha comentado en tu video`;
  return createNotification(
    videoOwnerId,
    "new_comment",
    content,
    commenterUserId,
    videoId,
    "video"
  );
};

/**
 * Crea una notificación de nuevo mensaje
 * @param recipientUserId ID del usuario que recibe el mensaje
 * @param senderUserId ID del usuario que envía el mensaje
 * @param senderUsername Nombre de usuario que envía el mensaje
 * @param chatId ID del chat
 */
export const createMessageNotification = async (
  recipientUserId: string,
  senderUserId: string,
  senderUsername: string,
  chatId: string
) => {
  const content = `${senderUsername} te ha enviado un mensaje`;
  return createNotification(
    recipientUserId,
    "new_message",
    content,
    senderUserId,
    chatId,
    "message"
  );
};
