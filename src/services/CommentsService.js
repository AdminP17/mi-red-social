// src/services/CommentsService.js

import { API, graphqlOperation } from "aws-amplify";
import {
  createComment,
  deleteComment,
} from "../graphql/mutations";

import {
  commentsByPostID,
  commentsByUserID,
} from "../graphql/queries";

class CommentsService {
  /**
   * Obtiene todos los comentarios de un post
   */
  static async getCommentsForPost(postID) {
    try {
      const result = await API.graphql(
        graphqlOperation(commentsByPostID, { postID })
      );
      return result.data.commentsByPostID.items;
    } catch (error) {
      console.error("Error al obtener comentarios del post:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los comentarios hechos por un usuario
   */
  static async getCommentsByUser(userID) {
    try {
      const result = await API.graphql(
        graphqlOperation(commentsByUserID, { userID })
      );
      return result.data.commentsByUserID.items;
    } catch (error) {
      console.error("Error al obtener comentarios del usuario:", error);
      throw error;
    }
  }

  /**
   * Crea un comentario nuevo
   */
  static async create(postID, userID, content) {
    try {
      const result = await API.graphql(
        graphqlOperation(createComment, {
          input: {
            postID,
            userID,
            content,
            createdAt: new Date().toISOString(),
          },
        })
      );

      return result.data.createComment;
    } catch (error) {
      console.error("Error al crear comentario:", error);
      throw error;
    }
  }

  /**
   * Elimina un comentario por ID
   */
  static async delete(commentID) {
    try {
      const result = await API.graphql(
        graphqlOperation(deleteComment, {
          input: { id: commentID },
        })
      );

      return result.data.deleteComment;
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      throw error;
    }
  }
}

export default CommentsService;
