# Sistema de Agendamento para Salão de Beleza

## Funcionalidades Implementadas

### 🎯 Página de Agendamento Público
- **Cabeçalho Personalizável**: Nome e logo do salão exibidos no topo da página
- **Processo de Agendamento em 4 Etapas**:
  1. Seleção de Serviço
  2. Seleção de Profissional
  3. Escolha de Data e Horário
  4. Confirmação dos Dados do Cliente
- **Barra de Progresso Visual**: Acompanha o usuário durante o processo
- **Resumo Fixo**: Mostra as escolhas feitas em cada etapa
- **Validação de Horários**: Considera disponibilidade dos profissionais e horários de funcionamento

### ⚙️ Painel Administrativo
- **Dashboard**: Visão geral dos agendamentos
- **Gestão de Profissionais**: Cadastro, edição e desativação
- **Gestão de Serviços**: Criação, edição e configuração de preços
- **Agendamentos**: Visualização e gestão de todos os agendamentos
- **Relatórios**: Análise de dados e métricas
- **Configurações**: Personalização completa do sistema

### 🏢 Configurações do Salão
- **Informações Básicas**: Nome, descrição, endereço
- **Logo Personalizável**: Upload de imagem com preview
- **Contato**: Telefone, email e website
- **Horários de Funcionamento**: Configuração de abertura e fechamento
- **Regras de Agendamento**: Buffer entre consultas, antecedência mínima/máxima
- **Notificações**: Configuração de emails e WhatsApp

### 🔐 Sistema de Autenticação
- **Login Seguro**: Acesso restrito ao painel administrativo
- **Rotas Protegidas**: Apenas usuários autenticados podem acessar o admin
- **Contexto de Autenticação**: Gerenciamento de estado do usuário

## Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Estilização**: Tailwind CSS
- **Roteamento**: React Router v6
- **Estado**: Context API + Hooks
- **Build**: Vite
- **Ícones**: Lucide React

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   └── Layout/         # Layouts da aplicação
├── contexts/           # Contextos React (Auth, Booking, Salon)
├── pages/              # Páginas da aplicação
├── backend/            # Simulação de backend
└── main.tsx           # Ponto de entrada
```

## Como Usar

### 1. Instalação
```bash
npm install
```

### 2. Desenvolvimento
```bash
npm run dev
```

### 3. Build de Produção
```bash
npm run build
```

### 4. Acesso
- **Página Pública**: `http://localhost:5173/`
- **Painel Admin**: `http://localhost:5173/admin`
- **Login**: `http://localhost:5173/login`

## Funcionalidades Principais

### Para Clientes
- Agendamento online 24/7
- Seleção de serviços e profissionais
- Escolha de horários disponíveis
- Confirmação por email
- Interface responsiva e intuitiva

### Para Administradores
- Gestão completa de profissionais
- Configuração de serviços e preços
- Visualização de agendamentos
- Relatórios e métricas
- Personalização da marca do salão

## Personalização

### Logo e Nome do Salão
1. Acesse o painel administrativo
2. Vá para "Configurações"
3. Na seção "Informações do Salão":
   - Altere o nome do salão
   - Faça upload do logo (formatos: JPG, PNG, GIF)
   - Configure descrição, endereço e contatos
4. Clique em "Salvar Informações do Salão"

### Configurações de Funcionamento
- Horários de abertura e fechamento
- Regras de agendamento
- Configurações de notificações
- Fuso horário e moeda

## Próximas Funcionalidades

- [ ] Integração com APIs de pagamento
- [ ] Sistema de lembretes automáticos
- [ ] App mobile para profissionais
- [ ] Integração com WhatsApp Business
- [ ] Sistema de fidelidade
- [ ] Relatórios avançados

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.
