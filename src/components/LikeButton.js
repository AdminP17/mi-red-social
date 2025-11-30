import React, { useEffect, useState, useCallback } from "react";
import { generateClient } from "aws-amplify/api";
import { createLike, deleteLike } from "../graphql/mutations";
import { listLikes } from "../graphql/queries";
import { getCurrentUser } from "aws-amplify/auth";

const client = generateClient();

export default function LikeButton({ postID }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeId, setLikeId] = useState(null);
  const [loading, setLoading] = useState(false);

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

      const existing = likes.find(l => l.userID === user.userId); // Check by userID not owner

      if (existing) {
        setLiked(true);
        setLikeId(existing.id);
      } else {
        setLiked(false);
        setLikeId(null);
      }
    } catch (err) {
      console.error("Error loading likes:", JSON.stringify(err, null, 2));
    }
  }, [postID]);

  async function toggleLike() {
    if (loading) return;
    setLoading(true);

    // Optimistic update
    const previousLiked = liked;
    const previousCount = likesCount;

    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);

    try {
      const user = await getCurrentUser();

      if (!previousLiked) {
        // ADD LIKE
        const result = await client.graphql({
          query: createLike,
          variables: {
            input: { postID, userID: user.userId }
          }
        });

        setLikeId(result.data.createLike.id);
      } else {
        // REMOVE LIKE
        if (likeId) {
          await client.graphql({
            query: deleteLike,
            variables: {
              input: { id: likeId }
            }
          });
          setLikeId(null);
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert optimistic update
      setLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={toggleLike}
        className={`flex items-center space-x-1 px-2 py-1 rounded-full transition ${liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
          }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${liked ? "fill-current scale-110" : "stroke-current fill-none"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      {likesCount > 0 && (
        <span className="text-sm text-gray-700 font-semibold">
          {likesCount}
        </span>
      )}
    </div>
  );
}
