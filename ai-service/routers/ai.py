from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.groq_service import generate_micro_plan, prioritize_tasks, voice_assist

router = APIRouter()


class MicroPlanRequest(BaseModel):
    task_name: str
    days_left: int
    effort_minutes: int


class TaskItem(BaseModel):
    name: str
    daysLeft: int
    effort: int


class PrioritizeRequest(BaseModel):
    tasks: list[TaskItem]


class VoiceRequest(BaseModel):
    transcript: str
    task_context: list[TaskItem] = []


@router.post("/micro-plan")
def micro_plan(req: MicroPlanRequest):
    try:
        steps = generate_micro_plan(req.task_name, req.days_left, req.effort_minutes)
        return {"steps": steps}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/prioritize")
def prioritize(req: PrioritizeRequest):
    try:
        tasks = [t.model_dump() for t in req.tasks]
        advice = prioritize_tasks(tasks)
        return {"advice": advice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice-assist")
def voice(req: VoiceRequest):
    try:
        context = [t.model_dump() for t in req.task_context]
        reply = voice_assist(req.transcript, context)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
