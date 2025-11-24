import React, { useEffect, useState } from "react";
import { generateClient } from "@aws-amplify/api";
import { listFollows } from "../graphql/queries";
import { createFollow, deleteFollow } from "../graphql/mutations";

const client = generateClient();

export default function FollowButton({ targetUserId, user }) {
  const [followingId, setFollowingId] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadFollowState();
    // eslint-disable-next-line
  }, [targetUserId]);

  async function loadFollowState() {
    // contar followers
    const resCount = await client.graphql({
      query: listFollows,
      variables: { filter: { followedID: { eq: targetUserId } } },
    });
    const followers = resCount.data.listFollows.items || [];
    setCount(followers.length);

    // comprobar si yo sigo a target
    const res = await client.graphql({
      query: listFollows,
      variables: { filter: { followerID: { eq: user?.attributes?.sub || user?.username }, followedID: { eq: targetUserId } } },
    });
    const items = res.data.listFollows.items || [];
    if (items.length > 0) setFollowingId(items[0].id);
    else setFollowingId(null);
  }

  async function toggleFollow() {
    if (!user) return;
    if (followingId) {
      await client.graphql({
        query: deleteFollow,
        variables: { input: { id: followingId } },
      });
      setFollowingId(null);
      setCount(c => Math.max(0, c - 1));
    } else {
      const res = await client.graphql({
        query: createFollow,
        variables: { input: { followerID: user.attributes.sub, followedID: targetUserId } },
      });
      setFollowingId(res.data.createFollow.id);
      setCount(c => c + 1);
    }
  }

  return <button onClick={toggleFollow}>{followingId ? "Siguiendo" : "Seguir"} · {count}</button>;
}
