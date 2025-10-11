
import React, { useState, useCallback, useRef } from 'react';
import type { FormData } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface OutputDisplayProps {
    output: string;
    isLoading: boolean;
    error: string | null;
    formData: FormData;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, isLoading, error, formData }) => {
    const [copyStatus, setCopyStatus] = useState('Salin Teks');
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);

    const formatOutputForDisplay = (text: string) => {
        return text
            .split('\n')
            .map((line, index) => {
                line = line.trim();
                if (line.startsWith('**') && line.endsWith('**')) {
                    // FIX: Property 'replaceAll' does not exist on type 'string'. Replaced with `replace` and a global regex.
                    return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-slate-800">{line.replace(/\*\*/g, '')}</h2>;
                }
                if (line.startsWith('*') && line.endsWith('*')) {
                     // FIX: Property 'replaceAll' does not exist on type 'string'. Replaced with `replace` and a global regex.
                     return <h3 key={index} className="text-lg font-semibold mt-3 mb-1 text-slate-700">{line.replace(/\*/g, '')}</h3>;
                }
                if (line.match(/^\d\.\s/)) {
                     return <h3 key={index} className="text-lg font-semibold mt-3 mb-1 text-slate-700">{line}</h3>;
                }
                if (line.startsWith('- **') && line.endsWith('**')) {
                    return <p key={index} className="mb-1"><span className="font-semibold">{line.substring(2, line.length - 2)}:</span></p>;
                }
                if (line.startsWith('-')) {
                    return <li key={index} className="ml-5 list-disc">{line.substring(1).trim()}</li>;
                }
                return <p key={index} className="mb-2">{line}</p>;
            });
    };

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(output).then(() => {
            setCopyStatus('Teks Disalin!');
            setTimeout(() => setCopyStatus('Salin Teks'), 2000);
        });
    }, [output]);

    const getFormattedDate = (dateString: string) => {
        if (!dateString) return '';
        // Using replace to ensure date is parsed as local time, not UTC
        const date = new Date(dateString.replace(/-/g, '/'));
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    const handleDownload = useCallback(() => {
        const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>`;
        const footer = "</body></html>";
        const formattedOutput = output
            // FIX: Property 'replaceAll' does not exist on type 'string'. Replaced with `replace` and a global regex.
            .replace(/\*\*/g, '')
            .split('\n')
            .map(line => `<p>${line}</p>`)
            .join('');
        
        const signatures = `
            <br/><br/><br/>
            <table style="width:100%;">
                <tr>
                    <td style="width:50%; text-align:left;">
                        <p>Mengetahui,</p>
                        <p>Kepala Sekolah</p>
                        <br/><br/><br/>
                        <p><strong>${formData.namaKepalaSekolah}</strong></p>
                        <p>NIP. ${formData.nipKepalaSekolah}</p>
                    </td>
                    <td style="width:50%; text-align:right;">
                        <p>${formData.tempatPembuatan}, ${getFormattedDate(formData.tanggalPembuatan)}</p>
                        <p>Guru Mata Pelajaran</p>
                        <br/><br/><br/>
                        <p><strong>${formData.namaGuru}</strong></p>
                        <p>NIP. ${formData.nipGuru}</p>
                    </td>
                </tr>
            </table>
        `;

        const sourceHTML = header + formattedOutput + signatures + footer;
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `RPM-${formData.mataPelajaran.replace(/\s/g, '_')}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);

    }, [output, formData]);

    const handlePdfDownload = useCallback(async () => {
        const element = outputRef.current;
        if (!element) return;

        setIsDownloadingPdf(true);
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const imgHeight = canvas.height * pageWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save(`RPM-${formData.mataPelajaran.replace(/\s/g, '_')}.pdf`);
        } catch (e) {
            console.error("Error generating PDF:", e);
            alert("Gagal membuat PDF. Silakan coba lagi.");
        } finally {
            setIsDownloadingPdf(false);
        }
    }, [formData]);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-xl font-bold text-slate-800">Hasil Rencana Pembelajaran</h2>
                {output && !isLoading && (
                    <div className="flex space-x-2 flex-wrap gap-y-2">
                        <button onClick={handleCopy} className="flex items-center space-x-1 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-1 px-3 rounded-md transition">
                            <CopyIcon className="h-4 w-4" />
                            <span>{copyStatus}</span>
                        </button>
                        <button onClick={handleDownload} className="flex items-center space-x-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded-md transition">
                            <DownloadIcon className="h-4 w-4" />
                            <span>Download (.doc)</span>
                        </button>
                        <button onClick={handlePdfDownload} disabled={isDownloadingPdf} className="flex items-center space-x-1 text-sm bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-md transition disabled:bg-slate-400 disabled:cursor-not-allowed">
                             {isDownloadingPdf ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Membuat PDF...</span>
                                </>
                            ) : (
                                <>
                                    <DownloadIcon className="h-4 w-4" />
                                    <span>Download (.pdf)</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
            <div ref={outputRef} className="prose prose-slate max-w-none min-h-[60vh] text-base leading-relaxed whitespace-pre-wrap p-2">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-slate-600">AI sedang merancang pembelajaran...</p>
                    </div>
                )}
                {error && <div className="text-red-600 bg-red-100 p-4 rounded-md">{error}</div>}
                {!isLoading && !output && !error && (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Hasil RPM Anda akan muncul di sini setelah formulir diisi dan dikirim.</p>
                    </div>
                )}
                {output && <div>{formatOutputForDisplay(output)}</div>}
                {output && !isLoading && (
                     <div className="mt-12 pt-8 text-sm text-slate-800">
                        <div className="flex justify-between">
                            <div className="text-left">
                                <p>Mengetahui,</p>
                                <p>Kepala Sekolah</p>
                                <br/><br/><br/>
                                <p className="font-bold">{formData.namaKepalaSekolah}</p>
                                <p>NIP. {formData.nipKepalaSekolah}</p>
                            </div>
                            <div className="text-right">
                                <p>{formData.tempatPembuatan}, {getFormattedDate(formData.tanggalPembuatan)}</p>
                                <p>Guru Mata Pelajaran</p>
                                <br/><br/><br/>
                                <p className="font-bold">{formData.namaGuru}</p>
                                <p>NIP. {formData.nipGuru}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
