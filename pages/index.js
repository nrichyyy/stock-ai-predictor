import { useState } from "react";

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [date, setDate] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, date }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Stock AI Predictor MVP</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <label>
          Stock Ticker:{" "}
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            required
            maxLength={5}
            style={{ textTransform: "uppercase" }}
          />
        </label>
        <br />
        <label>
          Date (YYYY-MM-DD):{" "}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {result && (
        <div style={{ whiteSpace: "pre-wrap", background: "#f0f0f0", padding: "1rem", borderRadius: 5 }}>
          <h2>Prediction Result:</h2>
          <p>{result.prediction}</p>
          <p><strong>Reasoning:</strong> {result.reasoning}</p>
          <p><strong>Confidence:</strong> {result.confidence}%</p>
          <p><strong>Forecast:</strong> {result.forecast}</p>
        </div>
      )}
    </div>
  );
}
