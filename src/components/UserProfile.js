import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { postsByUserID } from "../graphql/queries";
import { deleteUserProfile } from "../graphql/mutations";
import { getUrl } from "@aws-amplify/storage";
import FollowButton from "./FollowButton";

const client = generateClient();

export default function UserProfile({ user, onBack }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadUserPosts() {
            if (!user?.id) return;
            setLoading(true);
            try {
                const res = await client.graphql({
                    query: postsByUserID,
                    variables: { userID: user.id }
                });

                const items = res.data.postsByUserID.items;

                // Get URLs
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

                // Sort
                postsWithUrls.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                setPosts(postsWithUrls);
            } catch (err) {
                console.error("Error loading user posts:", err);
            } finally {
                setLoading(false);
            }
        }

        loadUserPosts();
    }, [user]);

    return (
        <div className="bg-white shadow-md rounded-xl p-6">
            <button
                onClick={onBack}
                className="mb-4 text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
                ← Volver
            </button>

            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={async () => {
                        if (window.confirm("¿Estás seguro de eliminar este perfil? Esta acción no se puede deshacer.")) {
                            try {
                                await client.graphql({
                                    query: deleteUserProfile,
                                    variables: { input: { id: user.id } }
                                });
                                alert("Perfil eliminado.");
                                onBack();
                            } catch (e) {
                                console.error("Error deleting profile:", e);
                                alert("Error al eliminar perfil.");
                            }
                        }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 hover:bg-red-50 px-3 py-1 rounded-lg transition"
                >
                    Eliminar Perfil
                </button>
            </div>

            <h3 className="text-xl font-bold mb-4 border-b pb-2">Publicaciones</h3>

            {loading && <div className="text-center py-4">Cargando posts...</div>}

            {!loading && posts.length === 0 && (
                <p className="text-gray-500">Este usuario no tiene publicaciones.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map(p => (
                    <div key={p.id} className="border rounded-lg overflow-hidden shadow-sm">
                        {p.imageUrl && (
                            <img src={p.imageUrl} alt="post" className="w-full h-48 object-cover" />
                        )}
                        <div className="p-3">
                            <p className="text-sm text-gray-800 line-clamp-3">{p.content}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
