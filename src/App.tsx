import React, { useEffect, useState } from "react";
import { fetchGemini, GeminiResponse } from "./services/geminiService";

/**
 * Explicitly defined prop & state interfaces to avoid TSX parser ambiguity
 */
interface AppProps {}

interface Battle {
  id: string;
  name: string;
  // add other fields as needed
}

const App: React.FC<AppProps> = () => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchGemini()
      .then((res: GeminiResponse) => {
        if (!mounted) return;
        // adapt according to the actual shape of res.data
        const items = (res.data?.battles ?? []) as Battle[];
        setBattles(items);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("fetchGemini error:", err);
        setError(String(err?.message ?? err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div role="alert">Error: {error}</div>;

  return (
    <main>
      <h1>BattleSim</h1>
      {battles.length === 0 ? (
        <p>No battles found.</p>
      ) : (
        <ul>
          {battles.map((b) => (
            <li key={b.id}>{b.name}</li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default App;