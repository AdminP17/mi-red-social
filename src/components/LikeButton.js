import React, { useEffect, useState, useCallback } from "react";
import { generateClient } from "aws-amplify/api";
import { createLike, deleteLike, createNotification } from "../graphql/mutations";
import { getCurrentUser } from "aws-amplify/auth";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "./Icons";

const client = generateClient();

export default function LikeButton({ postID }) {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeId, setLikeId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Custom query to fetch user with likes
  const listLikesWithUser = /* GraphQL */ `
    query ListLikes(
      $filter: ModelLikeFilterInput
      $limit: Int
      $nextToken: String
    ) {
      listLikes(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
          id
          postID
          userID
          user {
            id
          }
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
    }
  `;

  const loadLikes = useCallback(async () => {
    try {
      const user = await getCurrentUser();

      const result = await client.graphql({
        query: listLikesWithUser,
        variables: {
          filter: { postID: { eq: postID } }
        }
      });

      const allLikes = result.data.listLikes.items;

      // Filter out orphaned likes
      const validLikes = allLikes.filter(l => l.user !== null);

      setLikesCount(validLikes.length);

      const existing = validLikes.find(l => l.userID === user.userId);

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

        const newLike = result.data.createLike;
        setLikeId(newLike.id);

        // Create Notification (if not own post)
        // Fetch post to get owner
        const postRes = await client.graphql({
          query: `
            query GetPostOwner($id: ID!) {
              getPost(id: $id) {
                userID
              }
            }
          `,
          variables: { id: postID }
        });

        const postOwnerID = postRes.data.getPost.userID;

        // Custom mutation to avoid fetching post details which causes errors if postID is null or not resolved yet
        const createNotificationSimple = /* GraphQL */ `
          mutation CreateNotification(
            $input: CreateNotificationInput!
          ) {
            createNotification(input: $input) {
              id
              type
              content
              senderID
              receiverID
              createdAt
            }
          }
        `;

        if (postOwnerID && postOwnerID !== user.userId) {
          await client.graphql({
            query: createNotificationSimple,
            variables: {
              input: {
                type: "LIKE",
                content: "le dio like a tu publicación",
                senderID: user.userId,
                receiverID: postOwnerID,
                postID: postID
              }
            }
          });
        }

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

          // Remove Notification
          try {
            const { listNotifications } = require("../graphql/queries");
            const notifRes = await client.graphql({
              query: listNotifications,
              variables: {
                filter: {
                  senderID: { eq: user.userId },
                  type: { eq: "LIKE" },
                  postID: { eq: postID }
                }
              }
            });

            const notifsToDelete = notifRes.data.listNotifications.items;
            if (notifsToDelete.length > 0) {
              await Promise.all(notifsToDelete.map(n =>
                client.graphql({
                  query: createNotification, // Re-using the import but it's actually deleteNotification we need
                  query: require("../graphql/mutations").deleteNotification,
                  variables: { input: { id: n.id } }
                })
              ));
            }
          } catch (e) {
            console.warn("Error removing notification:", e);
          }
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
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleLike}
        className="flex items-center space-x-1 px-2 py-1 rounded-full transition-all hover:scale-110"
        disabled={loading}
      >
        <Icons.Heart
          size={22}
          color={liked ? colors.error : colors.textSecondary}
          filled={liked}
        />
      </button>
      {likesCount > 0 && (
        <span className="text-sm font-medium" style={{ color: colors.text }}>
          {likesCount}
        </span>
      )}
    </div>
  );
}
