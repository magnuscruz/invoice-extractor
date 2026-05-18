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
4.  `DEEPSEEK_API_KEY`: (Opcional) Sua chave de API da DeepSeek.

### Passos no Google Cloud

1.  Habilite as APIs: **Artifact Registry**, **Cloud Run**, **Cloud Build** e **Service Usage**.
2.  Crie uma Service Account e baixe a chave JSON.
3.  **Importante**: Garanta que a Service Account tenha as seguintes funções (Roles):
    -   `Administrador do Cloud Run` (Cloud Run Admin)
    -   `Escritor do Artifact Registry` (Artifact Registry Writer)
    -   `Usuário da conta de serviço` (Service Account User)

### 4. Tornando a aplicação pública (Erro 403 Forbidden)

Se ao acessar a URL você receber um erro **403 Forbidden**, é porque o Cloud Run está protegendo o acesso.

**Como corrigir manualmente:**
1. Vá ao Console do Google Cloud > **Cloud Run**.
2. Clique no seu serviço `invoice-extractor`.
3. Vá na aba **Segurança** (Security).
4. Selecione **Permitir invocações não autenticadas** (Allow unauthenticated invocations).
5. Clique em **Salvar**.

*Nota: Já atualizei o script de deploy para tentar fazer isso automaticamente nos próximos pushes.*

### 5. Configurando a Chave de API Manualmente (Se o GitHub falhar)

Se a extração falhar com erro de API ou se você não quiser usar Secrets do GitHub agora, você pode configurar a chave diretamente via **Cloud Shell**:

```bash
gcloud run services update invoice-extractor \
  --set-env-vars="GEMINI_API_KEY=SUA_CHAVE_AQUI" \
  --region=europe-west1
```

Substitua `SUA_CHAVE_AQUI` pela sua chave do Google AI Studio.

### Solução de Problemas (Erro de Permissão no Push)

Se o erro `denied: Permission 'artifactregistry.repositories.uploadArtifacts' denied` persistir:

1.  **Crie o repositório manualmente** (o GitHub não consegue criar sozinho sem permissão de Admin):
    ```bash
    gcloud artifacts repositories create gcr.io --repository-format=docker --location=europe-west1
    ```
2.  Certifique-se de que o nome do projeto no segredo `GCP_PROJECT_ID` do GitHub está exatamente igual ao ID do projeto no Google Cloud (não o nome, o ID).
3.  Verifique se a região no arquivo `.github/workflows/google-cloudrun-deploy.yml` é a mesma onde você criou o repositório (`europe-west1`).

