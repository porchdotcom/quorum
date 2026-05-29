"use client";

import { useEffect, useState } from "react";
import { Poll, PollMode } from "@/lib/types";

const POKER_POINTS = ["1", "2", "3", "5", "8", "13", "?"];

export default function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [poll, setPoll] = useState<Poll | null>(null);
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Record<string, { selected?: string; freeform?: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/polls/${id}/results`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) setError(data.error);
          else setPoll(data);
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  const setAnswer = (qId: string, field: "selected" | "freeform", value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], [field]: value },
    }));
  };

  const submit = async () => {
    const res = await fetch(`/api/polls/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, answers }),
    });
    if (res.ok) setSubmitted(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!poll) return null;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-gray-800">Response submitted</h2>
          <p className="text-gray-500 mt-2">Thanks for weighing in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
              {poll.mode}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{poll.title}</h1>
          {poll.context && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {poll.context}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="space-y-6">
          {poll.questions.map((q, i) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="font-medium text-gray-900 mb-1">
                {i + 1}. {q.text}
              </p>
              {q.recommendation && (
                <p className="text-xs text-indigo-600 mb-3">
                  Claude recommends: <span className="font-medium">{q.recommendation}</span>
                </p>
              )}

              {poll.mode === "poker" ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {POKER_POINTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setAnswer(q.id, "selected", p)}
                      className={`w-12 h-12 rounded-lg border text-sm font-bold transition-colors ${
                        answers[q.id]?.selected === p
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-200 text-gray-700 hover:border-indigo-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              ) : q.options?.length ? (
                <div className="space-y-2 mb-3">
                  {q.options.map((opt, j) => {
                    const label = String.fromCharCode(65 + j); // A, B, C...
                    return (
                      <button
                        key={opt}
                        onClick={() => setAnswer(q.id, "selected", opt)}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          answers[q.id]?.selected === opt
                            ? "bg-indigo-50 border-indigo-400 text-indigo-800"
                            : "border-gray-200 text-gray-700 hover:border-indigo-300"
                        }`}
                      >
                        <span className="font-medium">{label}.</span> {opt}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <textarea
                placeholder="Your thoughts... (optional)"
                value={answers[q.id]?.freeform ?? ""}
                onChange={(e) => setAnswer(q.id, "freeform", e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>
          ))}
        </div>

        <button
          onClick={submit}
          className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Submit response
        </button>
      </div>
    </div>
  );
}
