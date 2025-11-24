import React, { useEffect, useState } from "react";
import { generateClient } from "@aws-amplify/api";
import { getUrl } from "@aws-amplify/storage";
import { listPosts } from "../graphql/queries";
import { onCreatePost } from "../graphql/subscriptions";
import LikeButton from "./LikeButton";
import Comments from "./Comments";

const client = generateClient();

export default function Feed({ reload }) {
  const [posts, setPosts] = useState([]);

  async function loadPosts() {
    try {
      const res = await client.graphql({ query: listPosts });
      let items = res.data.listPosts.items;

      // 🔹 Obtener URLs si hay medios
      const postsWithUrls = await Promise.all(
        items.map(async (post) => {
          if (post.media && post.media.length > 0) {
            const fileKey = post.media[0];
            try {
              const urlResult = await getUrl({ key: fileKey });
              post.imageUrl = urlResult.url.toString();
            } catch (e) {
              console.warn("Error loading image URL:", e);
            }
          }
          return post;
        })
      );

      // 🔹 Ordenar por fecha
      postsWithUrls.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setPosts(postsWithUrls);
    } catch (err) {
      console.error("Error loading posts:", err);
    }
  }

  // ▶ Cargar posts al inicio
  useEffect(() => {
    loadPosts();
  }, []);

  // ▶ Recargar cuando App.js indique que hay un nuevo post
  useEffect(() => {
    if (reload > 0) loadPosts();
  }, [reload]);

  // ▶ Suscripción a tiempo real
  useEffect(() => {
    const subscription = client
      .graphql({ query: onCreatePost })
      .subscribe({
        next: async ({ data }) => {
          const newPost = data.onCreatePost;

          // Añadir URL de imagen
          if (newPost.media && newPost.media.length > 0) {
            try {
              const fileKey = newPost.media[0];
              const urlResult = await getUrl({ key: fileKey });
              newPost.imageUrl = urlResult.url.toString();
            } catch (e) {
              console.warn("Error loading subscription image URL:", e);
            }
          }

          // Evitar repetidos
          setPosts((prev) => {
            if (prev.some((p) => p.id === newPost.id)) {
              return prev;
            }
            return [newPost, ...prev];
          });
        },
        error: (err) => console.error("Subscription error:", err),
      });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      {posts.map((p) => (
        <div key={p.id} style={{ marginBottom: 30 }}>
          <p><strong>{p.owner}</strong></p>
          <p>{p.content}</p>

          {p.imageUrl && (
            <img
              src={p.imageUrl}
              alt="post"
              width={280}
              style={{ borderRadius: 8 }}
            />
          )}

          <LikeButton postID={p.id} />
          <Comments postId={p.id} />

          <hr />
        </div>
      ))}
    </div>
  );
}
