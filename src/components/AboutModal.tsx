import React, { useState } from 'react';
import { AppState } from '../types';
import { exportAppDataJson, importAppDataJson } from '../utils/storage';
import {
  X,
  Heart,
  ShieldCheck,
  Smartphone,
  Star,
  Download,
  Upload,
  Copy,
  Check,
  Code2,
  FileJson,
  Palette,
  ExternalLink,
  Sparkles,
  Layers,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onStateImported: (newState: AppState) => void;
}

const PACKAGE_JSON_CONTENT = `{
  "name": "habitos-simples",
  "version": "1.0.0",
  "description": "App leve, gratuito e offline para manter 4 hábitos essenciais: água, exercício, sono e remédios.",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "canvas-confetti": "^1.9.4",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.9.0",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "sharp": "^0.35.5",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2",
    "vite-plugin-pwa": "^2.0.0"
  }
}`;

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  state,
  onStateImported,
}) => {
  const [rated, setRated] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [copiedPackage, setCopiedPackage] = useState(false);
  const [activeTab, setActiveTab] = useState<'app' | 'logo' | 'package_json' | 'install' | 'android_code' | 'backup'>('app');
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyBackup = () => {
    const json = exportAppDataJson(state);
    navigator.clipboard.writeText(json);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2500);
  };

  const handleCopyPackageJson = () => {
    navigator.clipboard.writeText(PACKAGE_JSON_CONTENT);
    setCopiedPackage(true);
    setTimeout(() => setCopiedPackage(false), 2500);
  };

  const handleDownloadPackageJson = () => {
    const blob = new Blob([PACKAGE_JSON_CONTENT], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'package.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const imported = importAppDataJson(importText);
    if (imported) {
      onStateImported(imported);
      setImportStatus('Dados restaurados com sucesso! ✅');
      setTimeout(() => setImportStatus(null), 3000);
      setImportText('');
    } else {
      setImportStatus('Formato inválido. Verifique o texto copiado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl my-6 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <img
              src="/icon.svg"
              alt="Logotipo"
              className="w-10 h-10 rounded-2xl shadow-sm border border-slate-200 object-contain bg-white"
            />
            <div>
              <h3 className="text-base font-black text-slate-800 leading-tight">
                Hábitos Simples
              </h3>
              <p className="text-xs font-bold text-slate-500">Versão 1.0.0 Oficial</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-4 pt-2 bg-slate-50/50 gap-2 overflow-x-auto text-xs font-bold no-scrollbar">
          <button
            onClick={() => setActiveTab('app')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'app'
                ? 'border-sky-600 text-sky-800 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sobre o App
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logo'
                ? 'border-sky-600 text-sky-800 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Logotipo
          </button>
          <button
            onClick={() => setActiveTab('package_json')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'package_json'
                ? 'border-sky-600 text-sky-800 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            package.json
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'install'
                ? 'border-sky-600 text-sky-800 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Instalar no Celular 📲
          </button>
          <button
            onClick={() => setActiveTab('android_code')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'android_code'
                ? 'border-sky-600 text-sky-800 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Gerar APK / Código
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'backup'
                ? 'border-sky-600 text-sky-800 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Backup & Dados
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-700 text-sm">
          
          {/* TAB 1: SOBRE O APP */}
          {activeTab === 'app' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                <h4 className="font-black text-sky-950 flex items-center gap-1.5 mb-1 text-sm">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  100% Gratuito, Leve e Privado
                </h4>
                <p className="text-xs text-sky-900 leading-relaxed font-semibold">
                  O "Hábitos Simples" foi criado para resolver 4 dores reais do cotidiano sem complicação:
                  beber água no volume correto, exercitar o corpo, dormir com qualidade e não esquecer remédios.
                </p>
              </div>

              <div className="space-y-2 text-xs font-semibold">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-base">🚫</span>
                  <span><strong>Sem cadastro:</strong> Não pede seu e-mail, telefone nem senhas.</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-base">🚫</span>
                  <span><strong>Sem anúncios:</strong> Zero propagandas chatas ou vídeos invasivos.</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-base">⚡</span>
                  <span><strong>Funciona 100% Offline:</strong> Salvo diretamente no armazenamento local do celular.</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-base">🔋</span>
                  <span><strong>Super Leve:</strong> Sem processos pesados em segundo plano, economia de bateria.</span>
                </div>
              </div>

              {/* Avaliação */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <h4 className="font-black text-emerald-900 text-sm mb-1">
                  Você está gostando do Hábitos Simples?
                </h4>
                <p className="text-xs text-emerald-800 font-semibold mb-3">
                  Sua avaliação nos ajuda a manter o app 100% gratuito e simples!
                </p>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRated(true)}
                      className="p-1 hover:scale-125 transition text-amber-400 cursor-pointer"
                      title={`${star} estrelas`}
                    >
                      <Star className="w-6 h-6 fill-amber-400 stroke-amber-500" />
                    </button>
                  ))}
                </div>
                {rated && (
                  <p className="text-xs font-black text-emerald-700 mt-2 animate-in fade-in">
                    Muito obrigado pelo seu carinho e feedback! ⭐⭐⭐⭐⭐
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LOGOTIPO OFICIAL */}
          {activeTab === 'logo' && (
            <div className="space-y-4">
              <div className="border-2 border-slate-200 rounded-2xl p-4 bg-slate-50/50 text-center">
                <h4 className="text-sm font-black text-slate-800 mb-2">
                  Logotipo Oficial Horizontal
                </h4>
                <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-inner flex items-center justify-center">
                  <img
                    src="/logo.svg"
                    alt="Logotipo Oficial Hábitos Simples"
                    className="max-h-24 w-auto object-contain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="border border-slate-200 rounded-2xl p-3 bg-white">
                  <h5 className="text-xs font-black text-slate-700 mb-1.5">Ícone do App (Quadrado)</h5>
                  <img
                    src="/icon.svg"
                    alt="Ícone do Aplicativo"
                    className="w-16 h-16 mx-auto rounded-2xl shadow-sm border border-slate-100"
                  />
                  <p className="text-[10px] font-bold text-slate-500 mt-2">512x512 SVG / PWA</p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-3 bg-white flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-black text-slate-700 mb-1">Cores da Identidade</h5>
                    <div className="flex justify-center gap-1.5 mt-2">
                      <span className="w-5 h-5 rounded-full bg-sky-500" title="Água (#0284c7)" />
                      <span className="w-5 h-5 rounded-full bg-emerald-500" title="Exercício (#10b981)" />
                      <span className="w-5 h-5 rounded-full bg-indigo-500" title="Sono (#6366f1)" />
                      <span className="w-5 h-5 rounded-full bg-rose-500" title="Remédios (#f43f5e)" />
                      <span className="w-5 h-5 rounded-full bg-amber-400" title="Vitalidade (#facc15)" />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mt-2">Paleta Calmante & Acessível</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href="/logo.svg"
                  download="logo-habitos-simples.svg"
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-center"
                >
                  <Download className="w-4 h-4" />
                  Baixar Logotipo (SVG Vetorial)
                </a>

                <a
                  href="/logo.png"
                  download="logo-habitos-simples.png"
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-center"
                >
                  <Download className="w-4 h-4" />
                  Baixar Logotipo (PNG Alta Res)
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: PACKAGE.JSON */}
          {activeTab === 'package_json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <FileJson className="w-4 h-4 text-sky-600" />
                    Arquivo package.json
                  </h4>
                  <p className="text-xs font-semibold text-slate-500">
                    Configuração completa de dependências e scripts do app.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyPackageJson}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                    title="Copiar texto do package.json"
                  >
                    {copiedPackage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPackage ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPackageJson}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                    title="Baixar package.json"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar</span>
                  </button>
                </div>
              </div>

              {/* Code viewer */}
              <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800 max-h-72 shadow-inner">
                <pre>{PACKAGE_JSON_CONTENT}</pre>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                <p className="font-bold text-slate-700">Destaques das Dependências:</p>
                <p className="text-slate-600">• <strong>react / react-dom (v19):</strong> Interface ágil e reativa.</p>
                <p className="text-slate-600">• <strong>vite-plugin-pwa:</strong> Torna o app instalável no celular e 100% offline.</p>
                <p className="text-slate-600">• <strong>tailwindcss (v4):</strong> Design limpo com paleta calmante.</p>
                <p className="text-slate-600">• <strong>canvas-confetti & lucide-react:</strong> Ícones claros e celebração visual de metas.</p>
              </div>
            </div>
          )}

          {/* TAB 4: INSTALAR NO CELULAR */}
          {activeTab === 'install' && (
            <div className="space-y-4 text-xs font-semibold">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                <h4 className="text-sm font-black text-sky-950 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-sky-600" /> Como usar como App no seu Celular
                </h4>
                <p className="text-sky-900 leading-relaxed">
                  O Hábitos Simples é um Progressive Web App (PWA) de última geração. Você pode instalá-lo diretamente na tela inicial do seu celular em 5 segundos, sem precisar entrar na Google Play ou App Store!
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                <h5 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  🤖 No Android (Google Chrome):
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Abra este site no navegador <strong>Google Chrome</strong> do seu celular.</li>
                  <li>Toque nos <strong>3 pontinhos</strong> (canto superior direito).</li>
                  <li>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                  <li>Pronto! Um ícone oficial do Hábitos Simples aparecerá entre seus apps e abrirá em tela cheia como qualquer app da Play Store!</li>
                </ol>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                <h5 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  🍎 No iPhone / iPad (Safari):
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Abra este site no navegador <strong>Safari</strong> do iPhone.</li>
                  <li>Toque no botão de <strong>Compartilhar</strong> (o quadrado com uma seta para cima na barra inferior).</li>
                  <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
                  <li>Toque em <strong>"Adicionar"</strong> no canto superior direito.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 5: GERAR APK / CÓDIGO */}
          {activeTab === 'android_code' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-900 text-white rounded-2xl p-4 font-mono">
                <div className="flex items-center gap-2 mb-2 text-sky-400 font-bold text-xs">
                  <Code2 className="w-4 h-4" /> Para Desenvolvedores & Estudantes
                </div>
                <p className="text-slate-300 text-xs font-sans mb-3">
                  Instruções para exportar e compilar nativamente em Android Studio com Kotlin ou Flutter:
                </p>
                
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] space-y-2">
                  <p className="text-amber-300 font-bold">Opção 1: Gerar APK nativo direto com Capacitor:</p>
                  <p className="text-slate-400">
                    Execute no terminal da pasta do projeto:<br />
                    <span className="text-emerald-400 font-mono">npm install @capacitor/core @capacitor/cli @capacitor/android</span><br />
                    <span className="text-emerald-400 font-mono">npx cap init "Habitos Simples" com.habitos.simples</span><br />
                    <span className="text-emerald-400 font-mono">npm run build && npx cap add android</span><br />
                    <span className="text-emerald-400 font-mono">npx cap open android</span>
                  </p>
                  <p className="text-slate-400">
                    O Android Studio abrirá com o projeto Kotlin completo configurado. É só clicar em <strong>Run (Play ▶️)</strong> ou <strong>Build &gt; Build APK</strong> para gerar seu instalador!
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] space-y-2 mt-3">
                  <p className="text-sky-300 font-bold">Opção 2: Arquitetura em Flutter / Kotlin:</p>
                  <p className="text-slate-400">
                    O código segue 4 controladores desacoplados:<br />
                    • <strong>WaterManager:</strong> armazena consumo em ml e calcula peso * 35.<br />
                    • <strong>ExerciseManager:</strong> calcula streak com histórico de 7 dias.<br />
                    • <strong>SleepManager:</strong> aviso com 30min de antecedência.<br />
                    • <strong>MedicationManager:</strong> alarmes locais recorrentes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BACKUP & DADOS */}
          {activeTab === 'backup' && (
            <div className="space-y-4 text-xs font-semibold">
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                <h5 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-sky-600" /> Exportar Cópia de Segurança
                </h5>
                <p className="text-slate-600 text-xs">
                  Copie o texto de backup para guardar seus registros ou transferir para outro aparelho:
                </p>
                <button
                  onClick={handleCopyBackup}
                  className="w-full bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedBackup ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedBackup ? 'Copiado para a área de transferência!' : 'Copiar Meus Dados (JSON)'}</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                <h5 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" /> Restaurar Dados
                </h5>
                <textarea
                  rows={3}
                  placeholder="Cole aqui o texto do backup exportado..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono outline-none"
                />
                {importStatus && (
                  <p className="text-xs font-bold text-emerald-700">{importStatus}</p>
                )}
                <button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  Restaurar Dados
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500">
            Hábitos Simples • Feito com carinho para você
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 text-white font-black text-xs py-2 px-4 rounded-xl hover:bg-slate-900 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
