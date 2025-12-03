import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import { createFollow, deleteFollow } from "../graphql/mutations";
import { followsByFollowerID } from "../graphql/queries";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "./Icons";

const client = generateClient();

export default function FollowButton({ targetUserId }) {
  const { colors } = useTheme();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [followId, setFollowId] = useState(null);

  useEffect(() => {
    checkFollowStatus();
  }, [targetUserId]);

  async function checkFollowStatus() {
    try {
      const user = await getCurrentUser();
      setCurrentUserId(user.userId);

      if (user.userId === targetUserId) return; // No seguirse a sí mismo

      // Use GSI query instead of scan with filter
      const res = await client.graphql({
        query: followsByFollowerID,
        variables: {
          followerID: user.userId,
          filter: {
            followedID: { eq: targetUserId }
          }
        }
      });

      const items = res.data.followsByFollowerID.items;
      if (items.length > 0) {
        setIsFollowing(true);
        setFollowId(items[0].id);
      } else {
        setIsFollowing(false);
        setFollowId(null);
      }
    } catch (err) {
      console.log("Warning: Could not check follow status:", JSON.stringify(err, null, 2));
    }
  }

  async function toggleFollow() {
    if (!currentUserId) return;
    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        await client.graphql({
          query: deleteFollow,
          variables: { input: { id: followId } }
        });
        setIsFollowing(false);
        setFollowId(null);
      } else {
        // Follow
        const res = await client.graphql({
          query: createFollow,
          variables: {
            input: {
              followerID: currentUserId,
              followedID: targetUserId
            }
          }
        });

        setIsFollowing(true);
        setFollowId(res.data.createFollow.id);

        // Custom mutation to avoid fetching post details (which is null for follows)
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

        // Create Notification
        await client.graphql({
          query: createNotificationSimple,
          variables: {
            input: {
              type: "FOLLOW",
              content: "comenzó a seguirte",
              senderID: currentUserId,
              receiverID: targetUserId,
              // No postID for follows
            }
          }
        });
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFollow();
      }}
      disabled={loading}
      className="flex items-center space-x-1 px-3 py-1 text-sm rounded-full font-medium transition-all"
      style={{
        backgroundColor: isFollowing ? colors.bgSecondary : colors.primary,
        color: isFollowing ? colors.text : '#FFFFFF'
      }}
      onMouseEnter={(e) => {
        if (!isFollowing) {
          e.currentTarget.style.backgroundColor = colors.primaryHover;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isFollowing ? colors.bgSecondary : colors.primary;
      }}
    >
      {isFollowing ? <Icons.UserCheck size={16} color={colors.text} /> : <Icons.UserPlus size={16} color="#FFFFFF" />}
      <span>{loading ? "..." : isFollowing ? "Siguiendo" : "Seguir"}</span>
    </button>
  );
}
