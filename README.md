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

## ✅ Integração Contínua

Este projeto inclui um workflow do GitHub Actions em `.github/workflows/ci.yml` que executa as seguintes etapas em `push` e em `pull_request` para a branch `main`:

- Instala dependências: `npm install`
- Verifica tipos com TypeScript: `npm run lint`
- Constrói o projeto: `npm run build`

## 📄 Licença

Este projeto é distribuído sob a licença Apache-2.0.
