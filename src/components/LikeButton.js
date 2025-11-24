import React, { useEffect, useState, useCallback } from "react";
import { generateClient } from "@aws-amplify/api";
import { createLike, deleteLike } from "../graphql/mutations";
import { listLikes } from "../graphql/queries";
import { getCurrentUser } from "aws-amplify/auth";

const client = generateClient();

export default function LikeButton({ postID }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeId, setLikeId] = useState(null);

  const loadLikes = useCallback(async () => {
    try {
      const user = await getCurrentUser();

      const result = await client.graphql({
        query: listLikes,
        variables: {
          filter: { postID: { eq: postID } }
        }
      });

      const likes = result.data.listLikes.items;
      setLikesCount(likes.length);

      const existing = likes.find(l => l.owner === user.username);

      if (existing) {
        setLiked(true);
        setLikeId(existing.id);
      } else {
        setLiked(false);
        setLikeId(null);
      }
    } catch (err) {
      console.error("Error loading likes:", err);
    }
  }, [postID]);

  async function toggleLike() {
    try {
      if (!liked) {
        // ADD LIKE
        const result = await client.graphql({
          query: createLike,
          variables: {
            input: { postID }
          }
        });

        setLiked(true);
        setLikeId(result.data.createLike.id);
        setLikesCount(prev => prev + 1);

      } else {
        // REMOVE LIKE
        await client.graphql({
          query: deleteLike,
          variables: {
            input: { id: likeId }
          }
        });

        setLiked(false);
        setLikeId(null);
        setLikesCount(prev => prev - 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  }

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={toggleLike}>
        {liked ? "❤️ Quitar Me Gusta" : "🤍 Me Gusta"}
      </button>
      <p>{likesCount} likes</p>
    </div>
  );
}
