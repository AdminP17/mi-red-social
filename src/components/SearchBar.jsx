import React, { useState } from "react";
import { generateClient } from "aws-amplify/api";
import { listUserProfiles } from "../graphql/queries";

const client = generateClient();

export default function SearchBar({ onSelectUser }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  async function runSearch() {
    if (!query.trim()) return;

    try {
      const res = await client.graphql({
        query: listUserProfiles,
        variables: {
          filter: {
            username: { contains: query }
          }
        }
      });

      const items = res.data.listUserProfiles.items;
      setResults(items);
    } catch (err) {
      console.error("Error buscando usuarios:", err);
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar usuarios..."
        className="w-full p-3 border rounded-lg"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") runSearch();
        }}
      />

      {/* Resultados */}
      {results.length > 0 && (
        <div className="mt-3 border rounded-lg bg-gray-50 p-2">
          {results.map((u) => (
            <button
              key={u.id}
              onClick={() => onSelectUser(u)}
              className="block w-full text-left p-2 hover:bg-gray-200 rounded"
            >
              @{u.username}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
