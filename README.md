# SynergySphere - Advanced Team Collaboration Platform

A modern, full-stack SaaS application for team collaboration and project management, built with React, TypeScript, and Supabase.

## ✨ Features

### 🚀 Core Features
- **Beautiful Landing Page** - Modern hero section with smooth animations
- **Authentication System** - Secure login/signup with Supabase Auth
- **Project Management** - Create, manage, and track multiple projects
- **Kanban Board** - Drag-and-drop task management with real-time updates
- **Team Collaboration** - Invite members and assign roles
- **Modern Dashboard** - Overview of projects, tasks, and team activity

### 🎨 Design System
- **Dark Theme** - Professional dark theme with purple/blue gradients
- **Component Library** - Based on shadcn/ui with custom variants
- **Responsive Design** - Fully responsive for desktop and mobile
- **Smooth Animations** - Framer Motion animations throughout

### 🛠 Technical Features
- **TypeScript** - Full type safety
- **Supabase Backend** - Authentication, database, and real-time features
- **Drag & Drop** - DnD Kit for Kanban board functionality
- **Performance** - Optimized with React Query and efficient renders

## 🏗 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui with custom variants
- **Animations**: Framer Motion
- **Backend**: Supabase (Auth, Database, Real-time)
- **Drag & Drop**: @dnd-kit
- **State Management**: React Query

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd synergy-sphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up Supabase Database**
   
   Run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Enable Row Level Security
   ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

   -- Create profiles table
   CREATE TABLE public.profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     email TEXT UNIQUE NOT NULL,
     name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     PRIMARY KEY (id)
   );

   -- Create projects table
   CREATE TABLE public.projects (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Create tasks table
   CREATE TABLE public.tasks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT,
     status TEXT DEFAULT 'todo',
     priority TEXT DEFAULT 'medium',
     assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
     due_date TIMESTAMPTZ,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable RLS policies
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Users can view own profile" ON public.profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON public.profiles
     FOR UPDATE USING (auth.uid() = id);

   CREATE POLICY "Users can view projects they're members of" ON public.projects
     FOR SELECT USING (auth.uid() = owner_id);

   CREATE POLICY "Users can create projects" ON public.projects
     FOR INSERT WITH CHECK (auth.uid() = owner_id);

   CREATE POLICY "Users can view tasks in their projects" ON public.tasks
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM public.projects
         WHERE projects.id = tasks.project_id
         AND projects.owner_id = auth.uid()
       )
     );
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎨 Design System

SynergySphere uses a carefully crafted design system with:

- **Color Palette**: Dark theme with purple/blue gradients
- **Typography**: Clean, modern fonts with proper hierarchy
- **Components**: Custom shadcn/ui variants with hero styles
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design approach

### Key Design Tokens
- Primary: Purple (`hsl(263 70% 50%)`)
- Primary Glow: Light Purple (`hsl(250 100% 70%)`)
- Gradients: Dynamic gradients for hero elements
- Shadows: Elegant shadows with color-matched glows

## 📱 Features Overview

### Landing Page
- Modern hero section with animated background
- Feature highlights with smooth animations
- Call-to-action buttons with gradient effects

### Authentication
- Secure signup/login with Supabase
- Form validation and error handling
- Smooth modal animations

### Dashboard
- Project overview with statistics
- Recent activity feed
- Beautiful cards and progress indicators

### Project Management
- Create and manage multiple projects
- Progress tracking with visual indicators
- Team member management

### Kanban Board
- Drag-and-drop task management
- Real-time updates
- Priority and status indicators
- Task details with assignments and due dates

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── projects/       # Project management components
│   ├── kanban/         # Kanban board components
│   └── landing/        # Landing page components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utility libraries
├── pages/              # Page components
└── index.css          # Global styles and design system
```

## 🚀 Deployment

### Prerequisites
- Supabase project set up
- Domain configured (optional)

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide](https://lucide.dev/) for icons

---

Built with ❤️ using modern web technologies