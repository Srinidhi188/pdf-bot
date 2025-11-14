# # # main.py

# # import os
# # from fastapi import FastAPI, UploadFile, File
# # from fastapi.middleware.cors import CORSMiddleware

# # from rag import RAGPipeline

# # app = FastAPI()
# # rag = RAGPipeline()

# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=[
# #         "http://localhost:5173",
# #         "http://127.0.0.1:5173"
# #     ],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )



# # @app.post("/upload")
# # async def upload_pdf(file: UploadFile = File(...)):
# #     file_path = f"uploads/{file.filename}"
# #     os.makedirs("uploads", exist_ok=True)

# #     with open(file_path, "wb") as f:
# #         f.write(await file.read())

# #     result = rag.ingest_pdf(file_path)
# #     return result


# # @app.post("/ask")
# # async def ask_question(query: dict):
# #     question = query["question"]
# #     result = rag.query(question)
# #     return result


# import os
# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware

# from rag import RAGPipeline

# app = FastAPI()

# # CORS FIX
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",
#         "http://127.0.0.1:5173"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# rag = RAGPipeline()

# @app.post("/upload")
# async def upload_pdf(file: UploadFile = File(...)):
#     file_path = f"uploads/{file.filename}"
#     os.makedirs("uploads", exist_ok=True)

#     with open(file_path, "wb") as f:
#         f.write(await file.read())

#     return rag.ingest_pdf(file_path)


# @app.post("/ask")
# async def ask_question(query: dict):
#     question = query["question"]
#     return rag.query(question)


import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from rag import RAGPipeline
import google.genai as genai
from dotenv import load_dotenv
load_dotenv()

client = genai.Client()
print(client.models.list())


app = FastAPI()

# ⭐ FIXED CORS ⭐
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag = RAGPipeline()


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"
    os.makedirs("uploads", exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    return rag.ingest_pdf(file_path)


@app.post("/ask")
async def ask_question(query: dict):
    question = query["question"]
    return rag.query(question)
