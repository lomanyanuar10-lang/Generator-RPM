import { GoogleGenAI } from "@google/genai";
import type { FormData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getFase = (jenjang: string, kelas: string): string => {
    const k = parseInt(kelas, 10);
    if (jenjang === 'SD') {
        if (k <= 2) return 'A';
        if (k <= 4) return 'B';
        if (k <= 6) return 'C';
    }
    if (jenjang === 'SMP') {
        if (k <= 9) return 'D';
    }
    if (jenjang === 'SMA') {
        if (k === 10) return 'E';
        if (k >= 11) return 'F';
    }
    return ''; // Default case
};

const createPrompt = (formData: FormData): string => {
  const fase = getFase(formData.jenjang, formData.kelas);
  const alokasiWaktu = `${formData.jumlahPertemuan} Pertemuan (${formData.durasiPertemuan} per pertemuan)`;

  const praktikPedagogisText = formData.praktikPedagogis
    .map((p, i) => `- Pertemuan ${i + 1}: ${p}`)
    .join('\n');
    
  const praktikPedagogisTextForOutput = formData.praktikPedagogis
    .map((p, i) => `     - Pertemuan ${i + 1}: ${p}`)
    .join('\n');

  return `
Anda adalah seorang ahli perancangan kurikulum dan pedagogi yang sangat berpengalaman di Indonesia. Tugas Anda adalah membuat Rencana Pembelajaran Mendalam (RPM) yang komprehensif, terstruktur, dan inspiratif berdasarkan informasi yang diberikan.

Gunakan Bahasa Indonesia yang formal dan profesional. Pastikan output yang Anda hasilkan mengikuti format yang diminta dengan sangat ketat. Hasilkan output dalam format teks biasa yang terstruktur dengan baik. Gunakan format tabel markdown (dengan pemisah '|') untuk semua rubrik dan lembar observasi.

**INFORMASI PEMBELAJARAN:**
- Nama Satuan Pendidikan: ${formData.namaSatuanPendidikan}
- Nama Guru: ${formData.namaGuru}
- Mata Pelajaran: ${formData.mataPelajaran}
- Jenjang / Kelas / Fase: ${formData.jenjang} / Kelas ${formData.kelas} / Fase ${fase}
- Tahun Pelajaran: ${formData.tahunPelajaran}
- Alokasi Waktu: ${alokasiWaktu}
- Capaian Pembelajaran (CP): ${formData.capaianPembelajaran}
- Materi Pelajaran: ${formData.materiPelajaran}
- Praktik Pedagogis per Pertemuan:
${praktikPedagogisText}
- Dimensi Lulusan yang Dituju: ${formData.dimensiLulusan.join(', ')}

**FORMAT OUTPUT RPM (WAJIB DIIKUTI):**

---

**RENCANA PEMBELAJARAN MENDALAM (RPM)**

Nama Sekolah      : ${formData.namaSatuanPendidikan}
Nama Guru         : ${formData.namaGuru}
Mata Pelajaran    : ${formData.mataPelajaran}
Jenjang/Kelas/Fase: ${formData.jenjang} / Kelas ${formData.kelas} / Fase ${fase}
Alokasi Waktu     : ${alokasiWaktu}
Tahun Pelajaran   : ${formData.tahunPelajaran}

**1. IDENTIFIKASI**
   - **Murid:** Jelaskan profil singkat murid Kelas ${formData.kelas} ${formData.jenjang} (Fase ${fase}) secara umum, termasuk kemungkinan tingkat pemahaman awal dan gaya belajar mereka.
   - **Materi Pelajaran:** ${formData.materiPelajaran}
   - **Capaian Dimensi Lulusan:** ${formData.dimensiLulusan.join(', ')}

**2. DESAIN PEMBELAJARAN**
   - **Capaian Pembelajaran:** ${formData.capaianPembelajaran}
   - **Lintas Disiplin Ilmu:** (GENERATE OTOMATIS) Berdasarkan materi "${formData.materiPelajaran}", sebutkan 2-3 mata pelajaran lain yang relevan dan jelaskan secara singkat bagaimana materi ini terhubung.
   - **Tujuan Pembelajaran:** (GENERATE OTOMATIS) Turunkan 3-5 tujuan pembelajaran yang spesifik, terukur, dan dapat dicapai (SMART) dari Capaian Pembelajaran dan Materi Pelajaran yang diberikan.
   - **Topik Pembelajaran:** Rincikan topik-topik atau sub-materi utama yang akan dibahas dari materi pelajaran.
   - **Praktik Pedagogis per Pertemuan:**
${praktikPedagogisTextForOutput}
   - **Kemitraan Pembelajaran:** (GENERATE OTOMATIS) Sarankan satu atau dua kemitraan yang bisa dijalin (misalnya: dengan orang tua, komunitas lokal, atau profesional) untuk mendukung pembelajaran materi ini.
   - **Lingkungan Pembelajaran:** (GENERATE OTOMATIS) Deskripsikan lingkungan belajar yang kondusif untuk materi ini, baik di dalam maupun di luar kelas.
   - **Pemanfaatan Digital:** (GENERATE OTOMATIS) Sebutkan 2-3 alat atau platform digital (contoh: Quizlet, Canva, Google Earth, platform e-learning) yang bisa digunakan untuk memperkaya pembelajaran materi ini.

**3. PENGALAMAN BELAJAR**
   (GENERATE OTOMATIS) Untuk setiap pertemuan, jabarkan alur kegiatan belajar yang mencakup bagian Awal, Inti, Refleksi, dan Penutup. Pastikan untuk mengintegrasikan Praktik Pedagogis yang telah ditentukan untuk setiap pertemuan. Gunakan narasi yang jelas, praktis, dan berpusat pada murid.

${[...Array(formData.jumlahPertemuan)].map((_, i) => `   **Pertemuan ${i + 1} (${formData.praktikPedagogis[i]})**
   - **Awal (Berkesadaran, Bermakna, Menggembirakan):** Aktivitas pembuka untuk menarik minat murid dan menghubungkan dengan materi sebelumnya.
   - **Inti: Memahami & Mengaplikasi (Berkesadaran, Bermakna):** Kegiatan utama sesuai praktik pedagogis yang dipilih, fokus pada pemahaman konsep dan aplikasi.
   - **Refleksi (Berkesadaran, Menggembirakan):** Aktivitas untuk murid merenungkan apa yang telah dipelajari dan bagaimana mereka mempelajarinya.
   - **Penutup (Berkesadaran):** Rangkuman, umpan balik, dan penyampaian informasi untuk pertemuan berikutnya.
`).join('\n')}

**4. ASESMEN PEMBELAJARAN**
   (GENERATE OTOMATIS) Rancang tiga jenis asesmen yang komprehensif.

   **4.1. Asesmen sebagai Pembelajaran (Assessment as Learning / Diagnostik)**
   - **Tujuan:** Mengidentifikasi pengetahuan awal dan kesiapan belajar murid terkait materi "${formData.materiPelajaran}".
   - **Waktu:** Kegiatan Awal / Apersepsi (sebelum materi utama dimulai).
   - **Bentuk Penilaian:** Tanya Jawab Lisan.
   - **Pertanyaan Pemantik:** (GENERATE OTOMATIS) Buat 2-3 pertanyaan pemantik yang relevan untuk memancing pemikiran murid.
   - **Rubrik Penilaian Diagnostik:**
     | Kategori Pemahaman | Indikator Jawaban Murid         | Tindak Lanjut Guru |
     |--------------------|---------------------------------|--------------------|
     | Paham Seluruh      | (GENERATE OTOMATIS) Jelaskan indikator jawaban yang menunjukkan pemahaman utuh. | (GENERATE OTOMATIS) Jelaskan tindak lanjut, misal: dijadikan tutor sebaya atau diberi pertanyaan lanjutan. |
     | Paham Sebagian     | (GENERATE OTOMATIS) Jelaskan indikator jawaban yang menunjukkan pemahaman parsial atau miskonsepsi. | (GENERATE OTOMATIS) Jelaskan tindak lanjut, misal: diberi pertanyaan penuntun atau bantuan konseptual. |
     | Belum Paham        | (GENERATE OTOMATIS) Jelaskan indikator saat murid tidak mampu menjawab atau jawaban tidak relevan. | (GENERATE OTOMATIS) Jelaskan tindak lanjut, misal: diberi penjelasan dasar atau contoh konkret. |

   **4.2. Asesmen untuk Pembelajaran (Assessment for Learning / Formatif)**
   - **Tujuan:** Mengobservasi keterlibatan dan perkembangan dimensi lulusan "${formData.dimensiLulusan.join(', ')}" selama proses pembelajaran.
   - **Waktu:** Kegiatan Inti (misalnya, saat diskusi kelompok atau pengerjaan proyek).
   - **Bentuk Penilaian:** Lembar Observasi.
   - **Lembar Observasi Penilaian Sikap:**
     | No | Nama Murid | ${formData.dimensiLulusan.join(' | ')} | Keterangan |
     |----|------------|${formData.dimensiLulusan.map(d => '-'.repeat(Math.max(d.length, 3))).join('|')}|------------|
     | 1. |            | ${formData.dimensiLulusan.map(() => ' ').join(' | ')} |            |
     | 2. |            | ${formData.dimensiLulusan.map(() => ' ').join(' | ')} |            |
     | 3. | dst...     | ${formData.dimensiLulusan.map(() => ' ').join(' | ')} |            |
   - **Keterangan Penilaian Sikap:**
     - Isilah kolom dimensi dengan checklist (✓) atau skor **(BB=1, MB=2, BSH=3, SB=4)**.
     - **BB (Belum Berkembang):** Murid belum menunjukkan tanda-tanda perkembangan pada dimensi yang diamati.
     - **MB (Mulai Berkembang):** Murid mulai menunjukkan beberapa tanda perkembangan pada dimensi yang diamati.
     - **BSH (Berkembang Sesuai Harapan):** Murid telah menunjukkan perkembangan yang konsisten sesuai harapan pada dimensi yang diamati.
     - **SB (Sangat Berkembang):** Murid menunjukkan perkembangan yang melebihi harapan dan dapat menjadi teladan bagi teman-temannya.

   **4.3. Asesmen Hasil Pembelajaran (Assessment of Learning / Sumatif)**
   - **Tujuan:** Mengukur ketercapaian tujuan pembelajaran setelah satu lingkup materi selesai.
   - **Waktu:** Kegiatan Akhir atau pertemuan khusus untuk asesmen.
   - **Bentuk Penilaian:** Tes Tertulis dan Penugasan Produk.
   - **A. Tes Tertulis:**
     - **Indikator Penilaian:** (GENERATE OTOMATIS) Buat 2-3 indikator soal berdasarkan tujuan pembelajaran.
     - **Contoh Soal Esai:** (GENERATE OTOMATIS) Buat 2-3 soal esai yang relevan dengan indikator dan materi.
   - **B. Penugasan Produk:**
     - **Indikator Penilaian:** (GENERATE OTOMATIS) Buat 2-3 indikator untuk menilai produk (misal: poster, presentasi, model sederhana) yang relevan dengan materi.
     - **Contoh Tugas:** (GENERATE OTOMATIS) Berikan satu contoh tugas pembuatan produk yang jelas dan terukur.

**5. LAMPIRAN**
   
   **5.1. Lembar Kerja Murid (LKM)**
   (GENERATE OTOMATIS) Buatlah sebuah Lembar Kerja Murid (LKM) yang relevan dengan materi "${formData.materiPelajaran}" dan salah satu praktik pedagogis yang dipilih.
   - **Judul LKM:**
   - **Tujuan Pembelajaran:** (Sesuai dengan tujuan di atas)
   - **Alat dan Bahan:** (Jika diperlukan)
   - **Petunjuk Pengerjaan:**
   - **Langkah-Langkah Kegiatan / Soal-soal:** (Berisi aktivitas atau pertanyaan yang harus dikerjakan murid)

---
`;
};

export const generateRPM = async (formData: FormData): Promise<string> => {
    try {
        const prompt = createPrompt(formData);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Basic clean up
        let text = response.text;
        text = text.replace('---', '').trim();

        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Gagal berkomunikasi dengan server AI. Silakan coba lagi.");
    }
};