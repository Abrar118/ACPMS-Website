# Mathematics Club Website - Supabase-Only Architecture

A comprehensive web application for managing a mathematics club's activities, events, resources, and member interactions.

## 🏗️ System Architecture

### Technology Stack

**Frontend:**

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- Zustand (State Management)
- Supabase Client (@supabase/supabase-js)

**Backend:**

- Supabase (Complete Backend-as-a-Service)
- PostgreSQL (Managed by Supabase)
- Real-time subscriptions
- Row Level Security (RLS)
- Edge Functions (for complex logic)
- Storage (for file uploads)

**Infrastructure:**

- Vercel/Netlify (Frontend Deployment)
- Supabase Cloud (Backend Infrastructure)
- CDN for static assets

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Abrar118/ACPMS-Website
cd acpscm
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

```bash
# Copy .env.example to .env.local
cp .env.example .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📊 Website Sitemap

```
Mathematics Club Website
├── Home (/)
├── About Us (/about)
├── Executives (/executives)
├── Membership (/membership)
│   ├── Join Us (/membership/join)
│   └── My Profile (/membership/profile)
├── Magazine (/magazine)
│   ├── All Issues (/magazine/all)
│   └── Issue Detail (/magazine/[id])
├── Events (/events)
│   ├── All Events (/events/all)
│   ├── Workshops (/events/workshops)
│   ├── Sessions (/events/sessions)
│   ├── Competitions (/events/competitions)
│   └── Event Detail (/events/[id])
├── Resources (/resources)
│   ├── Helpful Links (/resources/links)
│   ├── Math Resources (/resources/math)
│   └── Problem Sets (/resources/problems)
├── Testimonials (/testimonials)
├── Admin Panel (/admin)
│   ├── Dashboard (/admin/dashboard)
│   ├── Users Management (/admin/users)
│   ├── Events Management (/admin/events)
│   ├── Magazine Management (/admin/magazines)
│   ├── Resources Management (/admin/resources)
│   └── Testimonials Management (/admin/testimonials)
└── Auth
    ├── Login (/auth/login)
    ├── Signup (/auth/signup)
    └── Profile (/auth/profile)
```

## 🗄️ Database Design

### Core Tables

#### Users Table

```sql
users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  institution TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'executive', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  bio TEXT,
  year_batch TEXT,
  profile_image TEXT,
  executive_position TEXT, -- Only for executives
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Events Table

```sql
events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  event_type TEXT CHECK (event_type IN ('event', 'workshop', 'session', 'competition')),
  location TEXT,
  poster_url TEXT,
  max_participants INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Magazines Table

```sql
magazines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  volume INTEGER,
  issue INTEGER,
  summary TEXT,
  cover_image TEXT,
  pdf_url TEXT,
  published_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Resources Table

```sql
resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('links', 'math_resources', 'problem_sets')),
  resource_type TEXT CHECK (resource_type IN ('pdf', 'link', 'document')),
  file_url TEXT,
  external_url TEXT,
  tags TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Event Registrations Table

```sql
event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN ('registered', 'attended', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

#### Testimonials Table

```sql
testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  affiliation TEXT,
  quote TEXT NOT NULL,
  image_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Users table policies
CREATE POLICY "Users can view approved members" ON users
  FOR SELECT USING (status = 'approved' OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Events policies
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);

CREATE POLICY "Executives can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('executive', 'admin')
    )
  );
```

### Role-Based Access Control

```javascript
// utils/permissions.js
export const hasPermission = (user, action, resource) => {
  const permissions = {
    admin: ['*'],
    executive: ['events:create', 'events:update', 'resources:create'],
    member: ['events:register', 'profile:update']
  }
  
  return permissions[user.role]?.includes(action) || 
         permissions[user.role]?.includes('*')
}
```

## 🔧 Supabase Configuration

### Authentication Setup

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Custom Hooks for Each Feature

```javascript
// hooks/useUsers.js
export const useUsers = () => {
  // User management logic
}

// hooks/useEvents.js
export const useEvents = () => {
  // Events management logic
}

// hooks/useMagazines.js
export const useMagazines = () => {
  // Magazine management logic
}

// hooks/useAdmin.js
export const useAdmin = () => {
  // Admin panel logic
}
```

## 🎨 Component Structure

### Shared Components

- Layout components
- Loading states
- Error boundaries
- Form components

### Feature-Specific Components

- AuthComponents
- UserComponents
- EventComponents
- RegistrationComponents
- MagazineComponents
- ResourceComponents
- AdminComponents
- TestimonialComponents

## 🚀 Deployment Strategy

### Environment Setup

- **Development**: Local Supabase + Next.js dev server
- **Staging**: Supabase cloud + Vercel preview
- **Production**: Supabase cloud + Vercel production

### CI/CD Pipeline

- GitHub Actions for automated testing
- Vercel for automatic deployments
- Supabase migrations for database changes

## 📈 Performance Optimizations

### Frontend Optimizations

- Next.js App Router for better performance
- Image optimization with Next.js Image component
- Code splitting by features
- Supabase real-time subscriptions for live updates

### Database Optimizations

- Proper indexing on frequently queried columns
- RLS policies for security and performance
- Supabase Edge Functions for complex operations

## 🎯 Key Features

### User Management

- Role-based authentication (member, executive, admin)
- Profile management
- User approval workflow
- Executive profiles with positions

### Events System

- Event creation and management
- Event registration system
- Real-time event updates
- Event categorization (workshops, sessions, competitions)
- Event calendar integration

### Magazine System

- Digital magazine publishing
- PDF viewer integration
- Volume and issue management
- Magazine archiving

### Resources Management

- Categorized resource library
- File upload and storage
- External link management
- Tag-based organization

### Admin Panel

- User management dashboard
- Event management
- Content moderation
- Analytics and reporting
- Testimonials management

### Real-time Features

- Live event updates
- Real-time notifications
- Dashboard statistics
- User activity tracking

## 📋 Development Phases

### Phase 1: Foundation & Setup

- Project setup and Supabase configuration
- Authentication system implementation
- Database schema design
- Basic user management

### Phase 2: Core Features

- Events system development
- Magazine management
- Resource library
- Admin panel basics

### Phase 3: Advanced Features

- Real-time functionality
- File upload system
- Advanced search and filtering
- Testimonials system

### Phase 4: Polish & Deployment

- Performance optimization
- Mobile responsiveness
- Final testing and deployment
- Documentation completion

## 🛠️ Development Guidelines

### Code Standards

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Conventional commits for version control
- Component-based architecture

### Testing Strategy

- Unit tests for utility functions
- Integration tests for API calls
- End-to-end testing for critical flows
- Manual testing for UI/UX

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
