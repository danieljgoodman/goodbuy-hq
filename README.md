# 🏢 GoodBuy HQ

**Your business headquarters for better buying decisions**

A modern, professional Next.js 14 application built with TypeScript, Tailwind CSS, and enterprise-grade best practices.

## ✨ Features

- **🚀 Next.js 14** with App Router and Server Components
- **📘 TypeScript** for type safety and better developer experience
- **🎨 Tailwind CSS** with professional business color scheme
- **🔧 ESLint & Prettier** for code quality and consistency
- **⚡ Performance Optimized** with modern web standards
- **🛡️ Error Handling** with comprehensive error boundaries
- **📱 Responsive Design** for all device sizes
- **♿ Accessibility** built-in with semantic HTML

## 🏗️ Project Structure

```
goodbuy-hq/
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── loading.tsx       # Global loading UI
│   │   ├── error.tsx         # Global error UI
│   │   └── not-found.tsx     # 404 page
│   ├── components/           # React components
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── error-boundary.tsx
│   │   │   └── loading.tsx
│   │   ├── layout/           # Layout components
│   │   └── forms/            # Form components
│   ├── lib/                  # Utility libraries
│   │   ├── utils.ts          # General utilities
│   │   └── constants.ts      # App constants
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # Global types
│   └── utils/                # Helper utilities
├── public/                   # Static assets
│   ├── images/
│   └── icons/
├── .env.local               # Environment variables (local)
├── .env.example             # Environment variables template
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── next.config.js          # Next.js configuration
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
└── package.json            # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd goodbuy-hq
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## 🎨 Color Scheme

The application uses a professional business color palette:

- **Primary**: Blue tones for main actions and branding
- **Secondary**: Gray tones for text and neutral elements
- **Accent**: Purple tones for highlights and special elements
- **Success**: Green tones for positive actions
- **Warning**: Yellow/Orange tones for cautions
- **Error**: Red tones for errors and destructive actions

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Application Settings
NEXT_PUBLIC_APP_NAME="GoodBuy HQ"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Database Configuration
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS="false"
NEXT_PUBLIC_ENABLE_DEBUG="true"
```

### Customization

#### Colors

Edit `tailwind.config.ts` to customize the color palette:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

#### Fonts

The project uses Inter font by default. To change:

1. Update the font import in `src/app/layout.tsx`
2. Modify the `fontFamily` in `tailwind.config.ts`

## 🛠️ Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow the configured ESLint rules
- Use Prettier for code formatting
- Prefer functional components with hooks

### Component Structure

```typescript
interface ComponentProps {
  // Define props with TypeScript
}

export default function Component({ prop }: ComponentProps) {
  // Component logic
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  )
}
```

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Types: `kebab-case.ts`
- Pages: `kebab-case.tsx` (Next.js convention)

## 📦 Dependencies

### Core

- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety

### Styling

- **Tailwind CSS** - Utility-first CSS
- **clsx** - Conditional classes
- **tailwind-merge** - Class merging utility

### Development

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Other Platforms

The application is a standard Next.js app and can be deployed to:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with PM2

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Commit Convention

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Daniel Goodman** - Project Owner & Lead Developer

## 🆘 Support

For support, please:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🗺️ Roadmap

- [ ] Authentication system
- [ ] Dashboard components
- [ ] API integration
- [ ] Database connectivity
- [ ] User management
- [ ] Analytics integration
- [ ] Testing setup
- [ ] CI/CD pipeline

---

Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS.
