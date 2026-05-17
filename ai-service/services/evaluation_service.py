import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class EvaluationService:
    """Rule-based session evaluation (MVP — no ML scoring)."""

    def evaluate(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        user_msgs = [m for m in messages if m.get("role") == "user"]
        assistant_msgs = [m for m in messages if m.get("role") == "assistant"]

        user_words = sum(len(m.get("content", "").split()) for m in user_msgs)
        turns = len(user_msgs)

        clarity = min(100, 45 + turns * 8 + min(30, user_words // 10))
        confidence = min(100, 40 + turns * 10)
        engagement = min(100, 35 + len(assistant_msgs) * 12 + turns * 5)
        total = round((clarity + confidence + engagement) / 3)

        summary = (
            f"You completed {turns} speaking turn(s) with approximately {user_words} words. "
            "Practice structuring answers with Situation, Task, Action, and Result. "
            "Continue mock sessions to improve clarity and confidence."
        )

        return {
            "totalScore": total,
            "confidenceScore": confidence,
            "clarityScore": clarity,
            "engagementScore": engagement,
            "categoryScores": [
                {
                    "name": "Communication Skills",
                    "score": clarity,
                    "comment": "Clarity improves with structured, concise answers.",
                },
                {
                    "name": "Technical Knowledge",
                    "score": max(50, total - 5),
                    "comment": "Add more technical depth and examples in responses.",
                },
                {
                    "name": "Problem Solving",
                    "score": max(48, total - 8),
                    "comment": "Walk through your reasoning step by step.",
                },
                {
                    "name": "Cultural Fit",
                    "score": engagement,
                    "comment": "Stay engaged and ask clarifying questions when needed.",
                },
                {
                    "name": "Confidence and Clarity",
                    "score": confidence,
                    "comment": "Speak with steady pacing and concrete outcomes.",
                },
            ],
            "strengths": [
                "Participated in the voice conversation",
                "Maintained session continuity" if turns > 1 else "Completed a first speaking turn",
            ],
            "areasForImprovement": [
                "Use STAR format for behavioral answers",
                "Include measurable impact in examples",
                "Reduce filler words and pauses",
            ],
            "finalAssessment": summary,
        }


evaluation_service = EvaluationService()
