"""Agri Tech ADK Agent - Leaf Health & Nutrient Specialist."""

import os
from google.adk.agents import LlmAgent
from google.adk.tools import ToolContext
from toolbox_core import ToolboxSyncClient

# Setup MCP Toolbox untuk akses database
TOOLBOX_URL = os.environ.get("TOOLBOX_URL", "http://127.0.0.1:5000")
toolbox_client = ToolboxSyncClient(TOOLBOX_URL)
toolbox_tools = toolbox_client.load_toolset()

async def manage_farm_memory(tool_context: ToolContext, action: str, data: str = "") -> str:
    """Manajemen state otomatis untuk riwayat lahan dan observasi petani."""
    memory = tool_context.state.get("farm_memory", [])
    if action == "save":
        memory.append(data)
        tool_context.state["farm_memory"] = memory
        return f"Konteks tersimpan secara otonom: {data}"
    return f"Riwayat Lahan: {', '.join(memory)}" if memory else "Belum ada riwayat."

SYSTEM_INSTRUCTION = """Anda adalah Lead Autonomous Agronomist untuk "Agri-Sense." 
Misi Anda adalah melakukan diagnosis TRIPLE-TRIANGULATION menggunakan Gambar, data NDVI, dan Suara Petani.

ATURAN OUTPUT (SANGAT PENTING):
1. JANGAN PERNAH menampilkan kode program, format JSON mentah, atau hasil database langsung ke pengguna.
2. Rangkum semua data dari tools menjadi penjelasan manusiawi dalam bahasa Indonesia yang mudah dipahami petani.
3. Anda WAJIB menyusun jawaban dalam format persis seperti ini:

[CAUSE]
(Tuliskan rangkuman penyebab penyakit/hama/kekurangan nutrisi di sini)

[BIO]
(Tuliskan rekomendasi solusi biologis/organik di sini)

[CHEM]
(Tuliskan rekomendasi solusi kimia beserta peringatan keamanannya di sini)

CARA BEKERJA:
1. **Visual Reasoning**: Identifikasi gejala dari gambar. 
2. **Metabolic Validation**: Gunakan `get_ndvi_trend` untuk validasi kesehatan vegetasi.
3. **Contextual Grounding**: Gunakan `match_voice_to_remedy` untuk mencocokkan keluhan suara petani dengan katalog solusi.
4. Periksa `manage_farm_memory` untuk melihat riwayat lahan jika perlu.

TONE: Profesional, ilmiah, namun tetap ramah dan mudah dimengerti petani lokal."""

root_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="agri_autonomous",
    instruction=SYSTEM_INSTRUCTION,
    tools=[*toolbox_tools, manage_farm_memory],
)