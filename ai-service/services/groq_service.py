import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def chat(system: str, user: str, max_tokens: int = 512) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        max_tokens=max_tokens,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()


def generate_micro_plan(task_name: str, days_left: int, effort_minutes: int) -> list[str]:
    system = (
        "You are a focused productivity coach. "
        "When given a task, return exactly 4 concrete action steps the user can start immediately. "
        "Each step must be under 20 words. "
        "Return only the 4 steps as a numbered list, no preamble, no extra text."
    )
    user = (
        f'Task: "{task_name}"\n'
        f"Due in: {days_left} day(s)\n"
        f"Estimated effort: {effort_minutes} minutes\n"
        "Give me 4 immediate action steps."
    )
    raw = chat(system, user, max_tokens=300)
    steps = [
        line.lstrip("0123456789.-) ").strip()
        for line in raw.splitlines()
        if line.strip()
    ]
    return steps[:4]


def prioritize_tasks(tasks: list[dict]) -> str:
    system = (
        "You are a strict productivity advisor. "
        "Given a list of tasks with deadlines and effort, recommend the order to tackle them today. "
        "Be direct. 3-4 sentences max."
    )
    task_list = "\n".join(
        [f"- {t['name']} (due: {t['daysLeft']} days, effort: {t['effort']} min)" for t in tasks]
    )
    user = f"My tasks:\n{task_list}\n\nWhat order should I tackle these today and why?"
    return chat(system, user, max_tokens=200)


def voice_assist(transcript: str, task_context: list[dict]) -> str:
    system = (
        "You are a smart, empathetic AI productivity assistant. "
        "The user has just spoken to you. Respond in 2-3 sentences — practical, direct, actionable. "
        "Acknowledge urgency if present. Suggest the single most important next step."
    )
    context = ""
    if task_context:
        context = "User's current tasks: " + ", ".join(
            [f'"{t["name"]}" due in {t["daysLeft"]} days' for t in task_context]
        )
    user = f"{context}\n\nUser said: \"{transcript}\""
    return chat(system, user, max_tokens=200)
