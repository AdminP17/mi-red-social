import React, { useEffect, useState, useCallback } from "react";
import { generateClient } from "@aws-amplify/api";
import { listComments } from "../graphql/queries";
import { createComment } from "../graphql/mutations";

const client = generateClient();

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const loadComments = useCallback(async () => {
    try {
      const res = await client.graphql({
        query: listComments,
        variables: {
          filter: { postID: { eq: postId } },
          limit: 100,
        },
      });

      setComments(res.data.listComments.items || []);
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function addComment() {
    if (!text.trim()) return;

    try {
      await client.graphql({
        query: createComment,
        variables: {
          input: { postID: postId, content: text },
        },
      });

      setText("");
      loadComments(); // Refresca sin recargar la página
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  }

  return (
    <div>
      <div>
        {comments.map((c) => (
          <div key={c.id}>
            <small>
              <strong>{c.owner}</strong> ·{" "}
              {new Date(c.createdAt).toLocaleString()}
            </small>
            <div>{c.content}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <input
          placeholder="Escribe un comentario..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={addComment}>Enviar</button>
      </div>
    </div>
  );
}
