/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, 
  Receipt, 
  Search, 
  MapPin, 
  Building2, 
  Calendar, 
  CreditCard, 
  Hash, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  User,
  ShoppingBag,
  Info
} from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  vat_rate: number;
}

interface ExtractionResult {
  merchant?: { name: string; nif: string; address: string };
  invoice?: { number: string; date: string; type: string };
  customer?: { name: string; nif: string };
  items?: InvoiceItem[];
  totals?: { net_amount: number; vat_amount: number; gross_total: number };
  currency?: string;
  atcud?: string;
  qr_code_link?: string;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem de fatura (JPG, PNG).');
      return;
    }
    setError(null);
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
    setResult(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleExtract = async () => {
    if (!preview) return;

    setIsLoading(true);
    setError(null);

    const base64Data = preview.split(',')[1];
    const mimeType = file?.type || 'image/jpeg';

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Data, mimeType }),
      });

      if (!response.ok) {
        throw new Error('Falha na extração. Tente novamente.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string = '€') => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency === '€' || !currency ? 'EUR' : currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 md:px-8 bg-white border-b border-slate-200 shadow-sm shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shadow-sm">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Fatura<span className="text-primary italic">AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Extração PT</p>
            <p className="text-sm font-medium text-slate-700">Contabilidade Digital</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center">
            <Building2 className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start overflow-hidden">
        {/* Left Pane: Selection / Document View */}
        <section className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upload do Documento</span>
            {preview && (
              <button 
                onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                className="text-[10px] font-bold text-red-500 uppercase hover:text-red-600 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
          
          <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center bg-slate-100">
            {preview ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-[450px] bg-white shadow-2xl p-4 md:p-6 rounded-sm border border-slate-200"
              >
                <img src={preview} alt="Invoice preview" className="w-full h-auto object-contain border border-slate-100" />
                <div className="mt-4 flex justify-between gap-4">
                   <button
                    onClick={handleButtonClick}
                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Trocar Documento
                  </button>
                </div>
              </motion.div>
            ) : (
              <div 
                onClick={handleButtonClick}
                className="w-full max-w-sm aspect-[3/4] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-slate-50 transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <FileUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Carregar Fatura</h3>
                <p className="text-xs text-slate-400">Arraste ou clique para selecionar<br/>(JPG, PNG, WebP)</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <button
              onClick={handleExtract}
              disabled={!preview || isLoading}
              className={`w-full py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-md
                ${!preview || isLoading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-primary text-white hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ANALISANDO...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  INICIAR EXTRAÇÃO INTELIGENTE
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Pane: Extracted Data */}
        <section className="flex flex-col gap-4 min-h-[600px]">
          <AnimatePresence mode="wait">
            {!result && !isLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                  <Receipt className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">Aguardando Documento</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Carregue uma fatura portuguesa para visualizar os dados extraídos automaticamente pela IA.
                </p>
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="h-48 bg-white border border-slate-200 rounded-xl animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
                  <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
                </div>
                <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
              </motion.div>
            )}

            {result && !isLoading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {/* Main Data Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full pulse"></span>
                    Dados do Emitente
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Nome Comercial</label>
                      <div className="mt-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold text-slate-900">
                        {result.merchant?.name || '---'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">NIF</label>
                        <div className="mt-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-mono font-bold">
                          {result.merchant?.nif || '---'}
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Data da Fatura</label>
                        <div className="mt-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold">
                          {result.invoice?.date || '---'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Número do Documento</label>
                      <div className="mt-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-mono font-bold text-primary">
                        {result.invoice?.number || '---'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consumer Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 rounded flex items-center justify-center text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Consumidor</p>
                      <p className="text-sm font-bold text-slate-800">{result.customer?.name || 'Consumidor Final'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">NIF Cliente</p>
                    <p className="text-xs font-mono font-bold text-slate-600">{result.customer?.nif || '---'}</p>
                  </div>
                </div>

                {/* Items Table */}
                {result.items && result.items.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Discriminação de Artigos</h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white shadow-sm z-10">
                          <tr className="text-[9px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                            <th className="px-4 py-2">Descrição</th>
                            <th className="px-3 py-2 text-right">Qtd</th>
                            <th className="px-4 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {result.items.map((item, id) => (
                            <tr key={id} className="text-xs hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-medium text-slate-700">{item.description}</td>
                              <td className="px-3 py-2.5 text-right text-slate-500">{item.quantity}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-slate-900">{formatCurrency(item.total, result.currency)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Totals */}
                <div className="bg-primary-dark text-white p-5 rounded-xl shadow-lg border border-white/10">
                  <div className="grid grid-cols-2 gap-y-3 mb-4">
                    <div className="text-[10px] font-bold text-blue-300 uppercase opacity-80 uppercase tracking-widest">Base Tributável</div>
                    <div className="text-right text-sm font-bold font-mono">{formatCurrency(result.totals?.net_amount, result.currency)}</div>
                    <div className="text-[10px] font-bold text-blue-300 uppercase opacity-80 uppercase tracking-widest">IVA Total</div>
                    <div className="text-right text-sm font-bold font-mono">{formatCurrency(result.totals?.vat_amount, result.currency)}</div>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-blue-300 uppercase opacity-80 uppercase tracking-widest leading-none mb-1">Total a Pagar</p>
                      <p className="text-xl font-bold tracking-tight">TOTAL FINAL</p>
                    </div>
                    <div className="text-3xl font-bold font-mono tracking-tighter">
                      {formatCurrency(result.totals?.gross_total, result.currency)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Referência ATCUD</p>
                    <p className="text-[10px] font-mono font-bold text-slate-600 break-all">{result.atcud || '---'}</p>
                  </div>
                  <button 
                    onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                    className="flex items-center justify-center p-4 bg-slate-800 text-white rounded-xl shadow-md hover:bg-slate-700 transition-all group"
                    title="Exportar/Novo"
                  >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Stats/History Footer */}
      <footer className="mt-auto h-24 bg-white border-t border-slate-200 px-6 py-3 shrink-0 flex items-center gap-6 overflow-hidden">
        <div className="shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Precisão da IA</p>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 w bg-slate-100 rounded-full overflow-hidden">
              <div className="w-[99%] h-full bg-green-500"></div>
            </div>
            <span className="text-xs font-bold text-slate-700">99.2%</span>
          </div>
        </div>
        <div className="hidden md:flex flex-1 gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg flex-1 max-w-[240px]">
            <div className="w-8 h-8 bg-slate-200 rounded-sm shrink-0"></div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold truncate uppercase text-slate-700">Audit. Mensal</p>
              <p className="text-[9px] text-slate-400">84 documentos processados</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg flex-1 max-w-[240px]">
            <div className="w-8 h-8 bg-slate-200 rounded-sm shrink-0"></div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold truncate uppercase text-slate-700">Exportação ERP</p>
              <p className="text-[9px] text-slate-400">Ligado ao Primavera v10</p>
            </div>
          </div>
        </div>
        <div className="ml-auto text-[10px] font-medium text-slate-400 flex flex-col items-end">
          <p>Processamento Certificado</p>
          <p>v1.2.4 Build stable</p>
        </div>
      </footer>
    </div>
  );
}


