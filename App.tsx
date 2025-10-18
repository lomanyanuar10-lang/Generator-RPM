import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import type { FormData } from './types';
import { generateRPM } from './services/geminiService';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    namaSatuanPendidikan: '',
    namaGuru: '',
    nipGuru: '',
    namaKepalaSekolah: '',
    nipKepalaSekolah: '',
    tempatPembuatan: '',
    tanggalPembuatan: new Date().toISOString().split('T')[0],
    tahunPelajaran: '2024/2025',
    jenjang: 'SD',
    kelas: '1',
    mataPelajaran: '',
    capaianPembelajaran: '',
    materiPelajaran: '',
    jumlahPertemuan: 1,
    durasiPertemuan: '2 x 35 menit',
    praktikPedagogis: ['Inkuiri'],
    dimensiLulusan: [],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string>('');

  const handleFormChange = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleJumlahPertemuanChange = useCallback((value: number) => {
    const newJumlah = Math.max(1, value);
    setFormData(prev => {
        const newPraktik = [...prev.praktikPedagogis];
        while(newPraktik.length < newJumlah) {
            newPraktik.push('Inkuiri');
        }
        return {
            ...prev,
            jumlahPertemuan: newJumlah,
            praktikPedagogis: newPraktik.slice(0, newJumlah)
        };
    });
  }, []);

  useEffect(() => {
    // Reset kelas when jenjang changes
    let defaultKelas = '1';
    if(formData.jenjang === 'SMP') defaultKelas = '7';
    if(formData.jenjang === 'SMA') defaultKelas = '10';
    setFormData(prev => ({...prev, kelas: defaultKelas}));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.jenjang]);


  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setOutput('');
    try {
      const result = await generateRPM(formData);
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = useMemo(() => {
    return Object.values(formData).every(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return true;
    });
  }, [formData]);

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Generator RPM</h1>
          <p className="text-sm sm:text-md text-slate-600">dibuat oleh Loman Yanuar Sidik, S.Pd.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputForm 
            formData={formData} 
            onFormChange={handleFormChange}
            onJumlahPertemuanChange={handleJumlahPertemuanChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isFormValid={isFormValid}
          />
          <OutputDisplay
            output={output}
            isLoading={isLoading}
            error={error}
            formData={formData}
          />
        </div>
      </main>

      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Generator RPM. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
};

export default App;
