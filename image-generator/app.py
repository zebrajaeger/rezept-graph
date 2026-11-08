
import base64
import io
import os
import threading
from contextlib import asynccontextmanager

import torch
from diffusers import FluxPipeline
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

MODEL_ID = os.getenv(
    "MODEL_ID",
    "black-forest-labs/FLUX.1-schnell"
)

pipeline = None
lock = threading.Lock()


class ImageRequest(BaseModel):
    prompt: str = Field(min_length=1)
    width: int = Field(default=1024, ge=256, le=1536)
    height: int = Field(default=1024, ge=256, le=1536)
    seed: int | None = Field(default=None, ge=0)
    response_format: str = "png"


def get_pipeline():
    global pipeline

    if pipeline is None:
        pipeline = FluxPipeline.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.bfloat16
        )

        # Speichersparend für 16 GB VRAM
        pipeline.enable_model_cpu_offload()
        pipeline.vae.enable_slicing()
        pipeline.vae.enable_tiling()

    return pipeline


app = FastAPI(title="Local Image Generator")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "cuda": torch.cuda.is_available()
    }


@app.post("/generate")
def generate(request: ImageRequest):
    if request.width % 16 or request.height % 16:
        raise HTTPException(
            400, "Width and height must be multiples of 16"
        )

    if request.response_format not in ("png", "b64_json"):
        raise HTTPException(400, "Invalid response_format")

    with lock:
        pipe = get_pipeline()

        generator = None
        if request.seed is not None:
            generator = torch.Generator(
                device="cpu"
            ).manual_seed(request.seed)

        with torch.inference_mode():
            image = pipe(
                prompt=request.prompt,
                width=request.width,
                height=request.height,
                num_inference_steps=4,
                guidance_scale=0.0,
                max_sequence_length=256,
                generator=generator
            ).images[0]

        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        data = buffer.getvalue()

    if request.response_format == "b64_json":
        return {
            "data": [{
                "b64_json": base64.b64encode(data).decode()
            }]
        }

    return Response(content=data, media_type="image/png")
