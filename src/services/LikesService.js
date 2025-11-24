import { generateClient } from "@aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";

const client = generateClient();

class LikesService {
  // Obtiene likes + si el usuario ya dio like
  async loadLikes(postID) {
    const user = await getCurrentUser();

    const result = await client.graphql({
      query: `
        query ListLikes($postID: ID!) {
          listLikes(filter: { postID: { eq: $postID } }) {
            items {
              id
              postID
              userID
              owner
            }
          }
        }
      `,
      variables: { postID }
    });

    const likes = result.data.listLikes.items;
    const existing = likes.find(l => l.owner === user.username);

    return {
      liked: !!existing,
      likeId: existing ? existing.id : null,
      count: likes.length
    };
  }

  // Agregar like
  async addLike(postID) {
    const result = await client.graphql({
      query: `
        mutation CreateLike($input: CreateLikeInput!) {
          createLike(input: $input) {
            id
            postID
            userID
          }
        }
      `,
      variables: {
        input: { postID }
      }
    });

    return result.data.createLike.id;
  }

  // Quitar like
  async removeLike(id) {
    await client.graphql({
      query: `
        mutation DeleteLike($input: DeleteLikeInput!) {
          deleteLike(input: $input) {
            id
          }
        }
      `,
      variables: { input: { id } }
    });
  }
}

const likesServiceInstance = new LikesService();
export default likesServiceInstance;
