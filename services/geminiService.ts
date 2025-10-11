
import { GoogleGenAI } from "@google/genai";
import type { FormData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const createPrompt = (formData: FormData): string => {
  const praktikPedagogisText = formData.praktikPedagogis
    .map((p, i) => `- Pertemuan ${i + 1}: ${p}`)
    .join('\n');
    
  const praktikPedagogisTextForOutput = formData.praktikPedagogis
    .map((p, i) => `     - Pertemuan ${i + 1}: ${p}`)
    .join('\n');

  return `
Anda adalah seorang ahli perancangan kurikulum dan pedagogi yang sangat berpengalaman di Indonesia. Tugas Anda adalah membuat Rencana Pembelajaran Mendalam (RPM) yang komprehensif, terstruktur, dan inspiratif berdasarkan informasi yang diberikan.

Gunakan Bahasa Indonesia yang formal dan profesional. Pastikan output yang Anda hasilkan mengikuti format yang diminta dengan sangat ketat. Hasilkan output dalam format teks biasa yang terstruktur dengan baik.

**INFORMASI PEMBELAJARAN:**
- Nama Satuan Pendidikan: ${formData.namaSatuanPendidikan}
- Mata Pelajaran: ${formData.mataPelajaran}
- Jenjang / Kelas: ${formData.jenjang} / Kelas ${formData.kelas}
- Materi Pelajaran: ${formData.materiPelajaran}
- Capaian Pembelajaran (CP): ${formData.capaianPembelajaran}
- Jumlah Pertemuan: ${formData.jumlahPertemuan}
- Durasi Setiap Pertemuan: ${formData.durasiPertemuan}
- Praktik Pedagogis per Pertemuan:
${praktikPedagogisText}
- Dimensi Lulusan yang Dituju: ${formData.dimensiLulusan.join(', ')}

**FORMAT OUTPUT RPM (WAJIB DIIKUTI):**

---

**RENCANA PEMBELAJARAN MENDALAM (RPM)**
Mata Pelajaran: ${formData.mataPelajaran}
Kelas / Jenjang: Kelas ${formData.kelas} / ${formData.jenjang}
Materi Pelajaran: ${formData.materiPelajaran}

**1. IDENTIFIKASI**
   - **Siswa:** Jelaskan profil singkat siswa Kelas ${formData.kelas} ${formData.jenjang} secara umum, termasuk kemungkinan tingkat pemahaman awal dan gaya belajar mereka.
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
   (GENERATE OTOMATIS) Untuk setiap pertemuan, jabarkan alur kegiatan belajar yang mencakup bagian Awal, Inti, Refleksi, dan Penutup. Pastikan untuk mengintegrasikan Praktik Pedagogis yang telah ditentukan untuk setiap pertemuan. Gunakan narasi yang jelas, praktis, dan berpusat pada siswa.

${[...Array(formData.jumlahPertemuan)].map((_, i) => `   **Pertemuan ${i + 1} (${formData.praktikPedagogis[i]})**
   - **Awal (Berkesadaran, Bermakna, Menggembirakan):** Aktivitas pembuka untuk menarik minat siswa dan menghubungkan dengan materi sebelumnya.
   - **Inti: Memahami & Mengaplikasi (Berkesadaran, Bermakna):** Kegiatan utama sesuai praktik pedagogis yang dipilih, fokus pada pemahaman konsep dan aplikasi.
   - **Refleksi (Berkesadaran, Menggembirakan):** Aktivitas untuk siswa merenungkan apa yang telah dipelajari dan bagaimana mereka mempelajarinya.
   - **Penutup (Berkesadaran):** Rangkuman, umpan balik, dan penyampaian informasi untuk pertemuan berikutnya.
`).join('\n')}

**4. ASESMEN PEMBELAJARAN**
   - **Asesmen Awal (Diagnostik/Apersepsi):** (GENERATE OTOMATIS) Berikan 1-2 contoh asesmen awal yang relevan untuk mengukur kesiapan siswa (contoh: pertanyaan pemantik, kuis singkat, peta konsep awal).
   - **Asesmen Proses (Formatif):** (GENERATE OTOMATIS) Berikan 2-3 contoh asesmen formatif (contoh: observasi partisipasi diskusi, rubrik kerja kelompok, penilaian diri/teman sebaya, umpan balik lisan).
   - **Asesmen Akhir (Sumatif):** (GENERATE OTOMATIS) Berikan 2-3 contoh asesmen sumatif yang dapat mengukur ketercapaian tujuan pembelajaran secara holistik (contoh: presentasi proyek, pembuatan produk/artefak, portofolio digital, studi kasus, tes esai).

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
