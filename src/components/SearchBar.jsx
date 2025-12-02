import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";
import { listUserProfiles } from "../graphql/queries";
import FollowButton from "./FollowButton";
import { useTheme } from "../context/ThemeContext";

const client = generateClient();

export default function SearchBar({ onSelectUser, currentUser }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        runSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  async function runSearch() {
    if (!query.trim()) return;
    setSearching(true);

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

      // Sort by createdAt desc
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setResults(items);
    } catch (err) {
      console.error("Error buscando usuarios:", JSON.stringify(err, null, 2));
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar personas..."
          className="block w-full pl-10 pr-3 py-2 rounded-lg leading-5 transition duration-150 ease-in-out focus:outline-none focus:ring-2"
          style={{
            backgroundColor: colors.surface,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            focusRingColor: colors.primary
          }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Resultados */}
      {query && (
        <div className="absolute z-10 mt-1 w-full shadow-lg rounded-md py-1 ring-1 ring-opacity-5 overflow-auto max-h-60" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          {results.length > 0 ? (
            results.map((u) => (
              <div
                key={u.id}
                className="flex justify-between items-center px-4 py-2 transition"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgSecondary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <button
                  onClick={() => {
                    onSelectUser(u);
                    setQuery(""); // Clear search on select
                    setResults([]);
                  }}
                  className="flex items-center space-x-3 flex-grow text-left"
                >
                  <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: colors.primaryLight, color: colors.primary }}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm font-medium" style={{ color: colors.text }}>@{u.username}</div>
                </button>
                {u.id && <FollowButton targetUserId={u.id} />}
              </div>
            ))
          ) : (
            !searching && (
              <div className="px-4 py-2 text-sm" style={{ color: colors.textSecondary }}>
                No se encontraron usuarios.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
