import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import { createFollow, deleteFollow } from "../graphql/mutations";
import { followsByFollowerID } from "../graphql/queries";

const client = generateClient();

export default function FollowButton({ targetUserId }) {
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
      // Suppress error overlay by not using console.error for expected operational errors if possible, 
      // but here we want to know. However, to stop the overlay from blocking the user:
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
      className={`px-3 py-1 text-sm rounded-full font-medium transition ${isFollowing
          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
          : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
    >
      {loading ? "..." : isFollowing ? "Siguiendo" : "Seguir"}
    </button>
  );
}
