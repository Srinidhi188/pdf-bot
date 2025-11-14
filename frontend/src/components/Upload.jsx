// import { useState } from "react";
// import axios from "axios";

// export default function Upload({ onUpload }) {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleUpload = async () => {
//     if (!file) return alert("Please select a PDF file.");

//     setLoading(true);

//     const formData = new FormData();
//     formData.append("file", file);

//     let res;
//     try {
//       res = await axios.post("http://127.0.0.1:8000/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//     } catch (err) {
//       console.log("UPLOAD ERROR:", err.response?.data || err);
//       alert("UPLOAD FAILED — SEE CONSOLE");
//       setLoading(false);
//       return;
//     }

//     console.log("SERVER RESPONSE:", res.data);

//     setLoading(false);

//     if (res.data.status === "success") {
//       onUpload();
//     } else {
//       alert("Backend returned error. Check console.");
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
//       <h1 className="text-4xl font-bold mb-6">Upload Your PDF</h1>

//       <input
//         type="file"
//         accept="application/pdf"
//         className="text-white mb-4"
//         onChange={(e) => setFile(e.target.files[0])}
//       />

//       <button
//         onClick={handleUpload}
//         disabled={loading}
//         className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
//       >
//         {loading ? "Processing..." : "Upload & Continue"}
//       </button>
//     </div>
//   );
// }

import { useState } from "react";
import { api } from "../api";

export default function Upload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file.");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLoading(false);

      if (res.data.status === "success") {
        alert("PDF uploaded successfully!");
        onUpload();
      }

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed — check backend!");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Upload Your PDF</h1>

      <input
        type="file"
        accept="application/pdf"
        className="text-white mb-4"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Processing..." : "Upload & Continue"}
      </button>
    </div>
  );
}

