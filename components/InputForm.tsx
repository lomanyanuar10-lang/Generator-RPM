
import React from 'react';
import type { FormData } from '../types';
import { JENJANG_OPTIONS, KELAS_OPTIONS, PRAKTIK_PEDAGOGIS_OPTIONS, DIMENSI_LULUSAN_OPTIONS } from '../constants';

interface InputFormProps {
    formData: FormData;
    onFormChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
    onJumlahPertemuanChange: (value: number) => void;
    onSubmit: () => void;
    isLoading: boolean;
    isFormValid: boolean;
}

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        {children}
    </div>
);

const TextInput: React.FC<{ name: keyof FormData; value: string; placeholder?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ name, value, placeholder, onChange }) => (
    <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition"
    />
);

const TextAreaInput: React.FC<{ name: keyof FormData; value: string; placeholder?: string; rows?: number; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }> = ({ name, value, placeholder, rows = 3, onChange }) => (
     <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition"
    />
);


export const InputForm: React.FC<InputFormProps> = ({ formData, onFormChange, onJumlahPertemuanChange, onSubmit, isLoading, isFormValid }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        onFormChange(e.target.name as keyof FormData, e.target.value);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const currentDimensi = formData.dimensiLulusan;
        const newDimensi = checked
            ? [...currentDimensi, value]
            : currentDimensi.filter(dimensi => dimensi !== value);
        onFormChange('dimensiLulusan', newDimensi);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Form Input Rencana Pembelajaran</h2>
            
            <fieldset className="space-y-4 border p-4 rounded-md">
                <legend className="text-lg font-semibold px-2">Informasi Umum</legend>
                <FormField label="Nama Satuan Pendidikan">
                    <TextInput name="namaSatuanPendidikan" value={formData.namaSatuanPendidikan} onChange={handleInputChange} />
                </FormField>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Nama Guru">
                        <TextInput name="namaGuru" value={formData.namaGuru} onChange={handleInputChange} />
                    </FormField>
                    <FormField label="NIP Guru">
                        <TextInput name="nipGuru" value={formData.nipGuru} onChange={handleInputChange} />
                    </FormField>
                    <FormField label="Nama Kepala Sekolah">
                        <TextInput name="namaKepalaSekolah" value={formData.namaKepalaSekolah} onChange={handleInputChange} />
                    </FormField>
                    <FormField label="NIP Kepala Sekolah">
                        <TextInput name="nipKepalaSekolah" value={formData.nipKepalaSekolah} onChange={handleInputChange} />
                    </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Tempat Pembuatan RPM">
                        <TextInput name="tempatPembuatan" value={formData.tempatPembuatan} onChange={handleInputChange} placeholder="Contoh: Jakarta" />
                    </FormField>
                    <FormField label="Tanggal Pembuatan RPM">
                         <input
                            type="date"
                            id="tanggalPembuatan"
                            name="tanggalPembuatan"
                            value={formData.tanggalPembuatan}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </FormField>
                </div>
            </fieldset>

            <fieldset className="space-y-4 border p-4 rounded-md">
                <legend className="text-lg font-semibold px-2">Detail Pembelajaran</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Jenjang Pendidikan">
                        <select name="jenjang" value={formData.jenjang} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition">
                            {JENJANG_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Kelas">
                        <select name="kelas" value={formData.kelas} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition">
                            {KELAS_OPTIONS[formData.jenjang]?.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </FormField>
                </div>
                 <FormField label="Mata Pelajaran">
                    <TextInput name="mataPelajaran" value={formData.mataPelajaran} onChange={handleInputChange} placeholder="Contoh: Ilmu Pengetahuan Alam"/>
                </FormField>
                <FormField label="Capaian Pembelajaran (CP)">
                    <TextAreaInput name="capaianPembelajaran" value={formData.capaianPembelajaran} onChange={handleInputChange} placeholder="Salin dan tempel CP dari kurikulum"/>
                </FormField>
                <FormField label="Materi Pelajaran">
                    <TextAreaInput name="materiPelajaran" value={formData.materiPelajaran} onChange={handleInputChange} placeholder="Contoh: Siklus Air dan Bencana Kekeringan"/>
                </FormField>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Jumlah Pertemuan">
                        <input type="number" min="1" max="10" name="jumlahPertemuan" value={formData.jumlahPertemuan} onChange={(e) => onJumlahPertemuanChange(parseInt(e.target.value, 10))} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </FormField>
                    <FormField label="Durasi Setiap Pertemuan">
                        <TextInput name="durasiPertemuan" value={formData.durasiPertemuan} onChange={handleInputChange} placeholder="Contoh: 2 x 45 menit"/>
                    </FormField>
                </div>
            </fieldset>

            <fieldset className="space-y-4 border p-4 rounded-md">
                <legend className="text-lg font-semibold px-2">Praktik Pedagogis</legend>
                <div className="space-y-2">
                    {Array.from({ length: formData.jumlahPertemuan }, (_, i) => (
                        <FormField key={i} label={`Pertemuan ${i + 1}`}>
                            <select 
                                value={formData.praktikPedagogis[i] || ''}
                                onChange={(e) => {
                                    const newPraktik = [...formData.praktikPedagogis];
                                    newPraktik[i] = e.target.value;
                                    onFormChange('praktikPedagogis', newPraktik);
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition"
                            >
                                {PRAKTIK_PEDAGOGIS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </FormField>
                    ))}
                </div>
            </fieldset>
            
            <fieldset className="space-y-2 border p-4 rounded-md">
                <legend className="text-lg font-semibold px-2">Dimensi Lulusan</legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DIMENSI_LULUSAN_OPTIONS.map(dimensi => (
                        <label key={dimensi} className="flex items-center space-x-2 text-sm">
                            <input
                                type="checkbox"
                                value={dimensi}
                                checked={formData.dimensiLulusan.includes(dimensi)}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{dimensi}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            <button
                onClick={onSubmit}
                disabled={isLoading || !isFormValid}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                    </>
                ) : 'Generate RPM'}
            </button>
            {!isFormValid && <p className="text-xs text-center text-red-500">Harap isi semua kolom untuk melanjutkan.</p>}
        </div>
    );
};
