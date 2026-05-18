# Fatura AI - Extrator de Notas Fiscais Portuguesas

Aplicação inteligente para extração de dados de faturas e recibos do regime fiscal português, utilizando Google Gemini AI.

## 🚀 Funcionalidades

- **Extração Inteligente**: Identifica automaticamente Emitente (NIF, Nome, Morada), Consumidor, Itens da Fatura e Totais.
- **Suporte a Documentos PT**: Reconhecimento de campos específicos como o código **ATCUD** e taxas de IVA portuguesas.
- **Interface Profissional**: Design limpo e intuitivo para contabilidade digital.
- **Processamento em Tempo Real**: Feedback visual instantâneo durante a análise do documento.

## 🛠️ Tecnologias

- **Frontend**: React 19, Vite, Tailwind CSS 4.
- **Backend**: Express (Node.js) com integração direta à API do Gemini.
- **IA**: Google Gemini 2.0 Flash para processamento de imagem e extração de JSON estruturado.
- **Animações**: Motion (framer-motion).
- **Ícones**: Lucide React.

## 📋 Pré-requisitos

- Node.js 20+
- Uma chave de API do Google AI Studio (Gemini API Key).

## 🔧 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/magnuscruz/invoice-extractor.git
   cd invoice-extractor
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```

4. Inicie em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🚀 Deploy Automático (Google Cloud Run)

Este repositório está configurado para deploy automático no Google Cloud Run via GitHub Actions sempre que houver um push na branch `main`.

### Configuração Necessária

Para que o deploy funcione, você precisa configurar os seguintes **Secrets** no seu repositório GitHub (`Settings > Secrets and variables > Actions`):

1.  `GCP_PROJECT_ID`: O ID do seu projeto no Google Cloud.
2.  `GCP_SA_KEY`: A chave JSON de uma Service Account com permissões de `Cloud Run Admin`, `Storage Admin` e `Service Account User`.
3.  `GEMINI_API_KEY`: Sua chave de API do Google AI Studio.

### Passos no Google Cloud

1.  Habilite as APIs: Cloud Run, Cloud Build e Container Registry.
2.  Crie uma Service Account e baixe a chave JSON.
3.  Garanta que a Service Account tenha as permissões mencionadas acima.

