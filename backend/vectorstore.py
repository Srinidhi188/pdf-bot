# vectorstore.py

import os
import faiss
import pickle

class VectorStore:
    def __init__(self, vector_dir="vectors"):
        self.vector_dir = vector_dir
        os.makedirs(self.vector_dir, exist_ok=True)

    def save(self, index, embeddings, name="store"):
        faiss.write_index(index, f"{self.vector_dir}/{name}.faiss")
        with open(f"{self.vector_dir}/{name}.pkl", "wb") as f:
            pickle.dump(embeddings, f)

    def load(self, name="store"):
        index_path = f"{self.vector_dir}/{name}.faiss"
        embeddings_path = f"{self.vector_dir}/{name}.pkl"

        if not os.path.exists(index_path):
            return None, None

        index = faiss.read_index(index_path)
        with open(embeddings_path, "rb") as f:
            embeddings = pickle.load(f)

        return index, embeddings
