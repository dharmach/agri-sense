# Agri-Sense: Autonomous Triangulation Diagnostic

Sistem diagnosa kesehatan tanaman otonom yang menggabungkan tiga input utama untuk memberikan analisis kesehatan tanaman yang akurat dan komprehensif.

## 🌟 Fitur Utama
Sistem ini bekerja dengan melakukan **Triple-Triangulation** data:
1.  **Visual (Image)**: Menganalisis gejala fisik pada daun (bercak, perubahan warna, pola serangan hama) menggunakan kapabilitas visi Gemini.
2.  **Metabolik (NDVI)**: Mengkorelasikan temuan visual dengan tren indeks vegetasi (NDVI) dari database untuk melihat kesehatan tanaman secara sistemik.
3.  **Kontekstual (Voice)**: Mengekstrak detail penting dari rekaman suara petani (riwayat pemupukan, kondisi cuaca lokal, umur tanaman).

## 🛠 Tech Stack
- **Core Engine**: Gemini 2.5 Flash (Multimodal)
- **Orchestration**: Google ADK (Agent Development Kit)
- **Database**: Cloud SQL for PostgreSQL (Storage untuk NDVI, referensi penyakit, dan katalog solusi)
- **Workflow**: Speckit (Specification-First Development)

## 📁 Struktur Proyek
- `plant_health/agent.py`: Logika utama agen otonom, manajemen memori lahan, dan instruksi sistem.
- `agri-sense_tools/tools.yaml`: Definisi tool SQL untuk integrasi data NDVI, pustaka penyakit, dan katalog solusi.
- `specs/`: Dokumentasi teknis, spesifikasi fitur (`spec.md`), rencana teknis (`plan.md`), dan daftar tugas (`tasks.md`).

## 🚀 Alur Kerja Otonom
Agen `agri_autonomous` tidak hanya menunggu perintah, tetapi secara proaktif:
- Meminta klarifikasi jika foto kurang jelas.
- Menyimpan "Farm Memory" untuk mengingat konteks lahan antar percakapan.
- Selalu memberikan dua opsi solusi: **Organik (Hayati)** dan **Kimia (dengan Peringatan Keamanan)**.

---
*Dikembangkan dengan standar Speckit untuk otomatisasi agronom digital.*