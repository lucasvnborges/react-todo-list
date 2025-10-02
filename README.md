# 📝 ToDo App

Uma aplicação de gerenciamento de tarefas construída com React, TypeScript e Clean Architecture, demonstrando boas práticas de desenvolvimento frontend.

## 🎯 Objetivo do projeto

Este projeto é uma aplicação ToDo que implementa os princípios da Clean Architecture, separando claramente as responsabilidades entre camadas de domínio, casos de uso, infraestrutura e apresentação.

## 🚀 Tecnologias utilizadas

### Core
- **React 19** - Biblioteca para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server ultra-rápido

### Styling
- **Tailwind CSS 4** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e customizáveis
- **Lucide React** - Ícones SVG

### State Management
- **Zustand** - Gerenciamento de estado global
- **TanStack Query** - Gerenciamento de estado servidor/cache
- **React Hook Form** - Gerenciamento de formulários

### Validation & Utils
- **Zod** - Validação de esquemas TypeScript-first
- **Class Variance Authority** - Utilitário para variantes de classes CSS

### Testing
- **Vitest** - Framework de testes unitários
- **Testing Library** - Utilitários para testes de componentes React
- **jsdom** - Implementação DOM para Node.js

### Development
- **ESLint** - Linter para JavaScript/TypeScript
- **Prettier** - Formatador de código
- **MirageJS** - Mock server para desenvolvimento

## 📦 Instalação e Execução

### Pré-requisitos
```bash
node >= 18
npm >= 9
```

### Instalar dependências
```bash
npm install
```

### Executar em modo desenvolvimento
```bash
npm run dev
```

### Executar testes
```bash
npm run test
```

### Executar testes com interface
```bash
npm run test:ui
```

### Executar testes com coverage
```bash
npm run test:coverage
```

### Build para produção
```bash
npm run build
```

### Preview da build de produção
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

### Formatação de código
```bash
npm run format
```

### Verificar formatação
```bash
npm run format:check
```

## 🏗️ Arquitetura do Projeto

O projeto segue os princípios da **Clean Architecture**, organizando o código em camadas bem definidas:

```
src/
├── components/           # Camada de Apresentação
│   ├── ui/              # Componentes base reutilizáveis
│   ├── TaskForm.tsx     # Formulário de criação de tarefas
│   ├── TaskItem.tsx     # Item individual de tarefa
│   ├── TaskList.tsx     # Lista de tarefas
│   └── tests/           # Testes dos componentes
├── domain/              # Camada de Domínio
│   ├── entities/        # Entidades de negócio
│   │   └── Task.ts      # Entidade Task e interfaces
│   └── usecases/        # Casos de uso/regras de negócio
│       └── TaskUseCases.ts
├── infrastructure/      # Camada de Infraestrutura
│   ├── repositories/    # Implementações de repositórios
│   │   └── MirageTaskRepository.ts
│   └── server/          # Configuração do mock server
│       └── mirage.ts
├── hooks/               # Custom hooks (Adaptadores)
│   ├── useTasks.ts      # Hook principal para operações de tarefas
│   └── useTasks.test.ts
├── store/               # Gerenciamento de estado global
│   ├── useUIStore.ts    # Store para estado da UI
│   └── useUIStore.test.ts
├── lib/                 # Utilitários e configurações
│   └── utils.ts
└── test/                # Configurações de teste
    └── setup.ts
```

### Camadas da Arquitetura

#### 🎯 Domain (Domínio)
- **Entities**: Definem as estruturas de dados principais (`Task`)
- **Use Cases**: Contêm a lógica de negócio pura, independente de frameworks

#### 🔌 Infrastructure (Infraestrutura)
- **Repositories**: Implementações concretas para acesso a dados
- **Server**: Configuração do mock server (MirageJS)

#### 🎨 Presentation (Apresentação)
- **Components**: Componentes React organizados por funcionalidade
- **Hooks**: Custom hooks que fazem a ponte entre UI e casos de uso
- **Store**: Gerenciamento de estado da aplicação

#### 🧪 Testing
- Testes unitários para todas as camadas
- Testes de integração para componentes
- Coverage configurado para garantir qualidade

### Fluxo de Dados

1. **UI Components** → chamam hooks personalizados
2. **Custom Hooks** → utilizam TanStack Query para cache e estado
3. **Use Cases** → executam lógica de negócio
4. **Repository** → abstrai acesso aos dados
5. **Infrastructure** → implementa comunicação com APIs/mock
