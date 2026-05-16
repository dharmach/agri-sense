"""FastAPI server wrapping the ADK agent.

Pre-built dev server with in-memory session storage.
"""

import os
import uvicorn
from fastapi import Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from google.adk.cli.fast_api import get_fast_api_app
from pydantic import BaseModel

# Import the agent
from plant_health.agent import root_agent

app = get_fast_api_app(web=True, agents_dir=".")

# Mount frontend
app.mount("/app", StaticFiles(directory="frontend", html=True), name="frontend")

@app.get("/")
def redirect_to_app():
    return RedirectResponse(url="/app/")

class DiagnoseRequest(BaseModel):
    image: str
    ndvi: float
    voiceContext: str

import aiohttp
import uuid

@app.post("/diagnose")
async def diagnose(req: DiagnoseRequest):
    # Enhanced prompt to ensure the agent returns a structured response that we can parse
    prompt = f"""NDVI Score: {req.ndvi}
Farmer Voice Context: {req.voiceContext}

Please diagnose this plant health issue based on the provided context.
Format your response using these exact headers so I can parse them:
[CAUSE]
[BIO]
[CHEM]
"""
    
    async with aiohttp.ClientSession() as session:
        # 1. Create a session
        user_id = "frontend_user"
        create_sess_url = f"http://127.0.0.1:8080/apps/plant_health/users/{user_id}/sessions"
        async with session.post(create_sess_url, json={}) as resp:
            sess_data = await resp.json()
            session_id = sess_data.get("id")
            
        # 2. Run the agent
        run_url = "http://127.0.0.1:8080/run"
        payload = {
            "appName": "plant_health",
            "userId": user_id,
            "sessionId": session_id,
            "newMessage": {
                "parts": [{"text": prompt}]
            }
        }
        async with session.post(run_url, json=payload) as resp:
            run_data = await resp.json()
            
            # Robust text extraction: Search for 'text' everywhere and avoid JSON remnants
            result_text = ""
            
            def find_text_recursively(obj):
                nonlocal result_text
                if isinstance(obj, dict):
                    # Check for 'text' key but ignore if it's metadata
                    if "text" in obj and isinstance(obj["text"], str):
                        # Avoid 'thought' parts which often contain internal reasoning
                        if "thought" not in obj:
                            result_text += obj["text"]
                    else:
                        for k, v in obj.items():
                            # Skip known metadata keys that clutter the output
                            if k not in ["thought", "thoughtSignature", "usageMetadata", "actions"]:
                                find_text_recursively(v)
                elif isinstance(obj, list):
                    for item in obj:
                        find_text_recursively(item)

            try:
                find_text_recursively(run_data)
                
                # If still empty or looks like JSON, do a final cleanup
                if not result_text or result_text.strip().startswith("{"):
                    # Fallback to a cleaner string representation if possible
                    result_text = str(run_data)
            except Exception:
                result_text = str(run_data)
            
            # Final cleanup of any literal escape characters
            result_text = result_text.replace("\\n", "\n").replace("\\t", "    ")
                
    return {"result": result_text}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("server:app", host="0.0.0.0", port=port)

