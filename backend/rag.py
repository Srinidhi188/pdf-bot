# import os
# import faiss
# import numpy as np
# from fireworks.client import Fireworks
# from sentence_transformers import SentenceTransformer
# from langchain_community.document_loaders import PyPDFLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from vectorstore import VectorStore


# print("🚀 RAG FILE LOADED — THIS IS THE CORRECT FILE")


# class RAGPipeline:
#     def __init__(self):
#         api_key = os.getenv("FIREWORKS_API_KEY")
#         if not api_key:
#             raise EnvironmentError("FIREWORKS_API_KEY not set!")

#         print("🔥 USING FIREWORKS RAG NOW")

#         # Fireworks client
#         self.client = Fireworks(api_key=api_key)

#         # Embeddings
#         self.embed_model = SentenceTransformer("all-MiniLM-L6-v2")

#         # FAISS vector DB
#         self.vector_db = VectorStore()

#     def ingest_pdf(self, file_path):
#         loader = PyPDFLoader(file_path)
#         pages = loader.load()

#         splitter = RecursiveCharacterTextSplitter(
#             chunk_size=800,
#             chunk_overlap=100
#         )

#         docs = splitter.split_documents(pages)
#         texts = [d.page_content for d in docs]

#         embeddings = self.embed_model.encode(texts).astype("float32")

#         dim = embeddings.shape[1]
#         index = faiss.IndexFlatL2(dim)
#         index.add(embeddings)

#         self.vector_db.save(index, texts, name="store")

#         return {"status": "success", "chunks": len(texts)}

#     def query(self, question):
#         print("🔥 QUERYING USING FIREWORKS")

#         index, texts = self.vector_db.load("store")
#         if index is None:
#             return {"error": "No documents found."}

#         q_emb = self.embed_model.encode([question]).astype("float32")
#         distances, indices = index.search(q_emb, 3)

#         matched_chunks = [texts[i] for i in indices[0]]
#         context = "\n\n---\n\n".join(matched_chunks)

#         prompt = f"""
# Use ONLY this context to answer:

# {context}

# Question: {question}
# """

#         response = self.client.chat.completions.create(
#              model="accounts/fireworks/models/llama-v3p1-8b-instruct",
#             messages=[{"role": "user", "content": prompt}],
#         )

#         return {
#             "answer": response.choices[0].message["content"],
#             "citations": matched_chunks
#         }

import os
import faiss
import numpy as np
from fireworks.client import Fireworks
from sentence_transformers import SentenceTransformer
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from vectorstore import VectorStore


print("🚀 RAG FILE LOADED — THIS IS THE CORRECT FILE")


class RAGPipeline:
    def __init__(self):
        api_key = os.getenv("FIREWORKS_API_KEY")
        if not api_key:
            raise EnvironmentError("FIREWORKS_API_KEY not set!")

        print("🔥 USING FIREWORKS RAG NOW")

        # Initialize Fireworks client
        self.client = Fireworks(api_key=api_key)

        # Embedding model
        self.embed_model = SentenceTransformer("all-MiniLM-L6-v2")

        # Vector database
        self.vector_db = VectorStore()

    def ingest_pdf(self, file_path):
        loader = PyPDFLoader(file_path)
        pages = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100
        )

        docs = splitter.split_documents(pages)
        texts = [d.page_content for d in docs]

        embeddings = self.embed_model.encode(texts).astype("float32")

        dim = embeddings.shape[1]
        index = faiss.IndexFlatL2(dim)
        index.add(embeddings)

        self.vector_db.save(index, texts, name="store")

        return {"status": "success", "chunks": len(texts)}

    def query(self, question):
        print("🔥 QUERYING USING FIREWORKS")

        index, texts = self.vector_db.load("store")
        if index is None:
            return {"error": "No documents found."}

        q_emb = self.embed_model.encode([question]).astype("float32")
        distances, indices = index.search(q_emb, 3)

        matched_chunks = [texts[i] for i in indices[0]]
        context = "\n\n---\n\n".join(matched_chunks)

        prompt = f"""
Use ONLY this context to answer:

{context}

Question: {question}
"""

        # 🔥 FIXED — correct Fireworks model + response format
        response = self.client.chat.completions.create(
            model="accounts/fireworks/models/llama-v3p1-8b-instruct",
            messages=[{"role": "user", "content": prompt}],
        )

        return {
            "answer": response.choices[0].message.content,
            "citations": matched_chunks
        }
