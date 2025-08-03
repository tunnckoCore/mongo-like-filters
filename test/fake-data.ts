// Test data interfaces
export interface UserBase {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  roles: string[];
  profile: {
    bio: string;
    skills: string[];
    location: {
      city: string;
      country: string;
    };
  };
}

export type UserWithMetadata = UserBase & {
  metadata: {
    lastLogin?: string;
    preferences: Record<string, any>;
  };
};

export type User = UserBase | UserWithMetadata;

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  tags: string[];
  specs: {
    weight: number;
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
  };
  createdAt: Date;
}

export interface Company {
  id: number;
  name: string;
  founded: Date;
  employees: Employee[];
  departments: Department[];
  headquarters: Address;
  metadata: {
    industry: string;
    revenue?: number;
    public: boolean;
    subsidiaries: Company[];
  };
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  salary: number;
  department: string;
  skills: Skill[];
  address: Address;
  manager?: Employee;
  directReports: Employee[];
}

export interface Department {
  id: number;
  name: string;
  budget: number;
  head: Employee;
  teams: Team[];
}

export interface Team {
  id: number;
  name: string;
  members: Employee[];
  projects: Project[];
}

export interface Project {
  id: number;
  name: string;
  status: 'active' | 'completed' | 'on-hold';
  deadline: Date;
  budget: number;
  tags: string[];
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Test data
export const users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    isActive: true,
    roles: ['admin', 'user'],
    profile: {
      bio: 'Senior developer with 10 years experience',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      location: {
        city: 'New York',
        country: 'USA',
      },
    },
    metadata: {
      lastLogin: '2025-07-30',
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en',
      },
    },
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 25,
    isActive: false,
    roles: ['user'],
    profile: {
      bio: 'Senior manager with 5 years experience',
      skills: ['Serverless', 'TypeScript'],
      location: {
        city: 'San Francisco',
        country: 'USA',
      },
    },
    metadata: {
      preferences: {
        theme: 'light',
      },
    },
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@test.com',
    age: 35,
    isActive: true,
    roles: ['user', 'moderator'],
    profile: {
      bio: 'Full-stack engineer',
      skills: ['Python', 'JavaScript', 'Docker'],
      location: {
        city: 'London',
        country: 'UK',
      },
    },
    metadata: {
      lastLogin: '2025-07-29',
      preferences: {
        theme: 'dark',
        timezone: 'GMT',
      },
    },
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Laptop Pro',
    price: 1299.99,
    category: 'electronics',
    tags: ['computer', 'portable', 'work'],
    specs: {
      weight: 1.5,
      dimensions: {
        width: 30,
        height: 2,
        depth: 20,
      },
    },
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 2,
    name: 'Gaming Mouse',
    price: 79.99,
    category: 'accessories',
    tags: ['gaming', 'peripheral', 'rgb'],
    specs: {
      weight: 0.1,
      dimensions: {
        width: 12,
        height: 4,
        depth: 7,
      },
    },
    createdAt: new Date('2025-01-15'),
  },
];

export const company: Company = {
  id: 1,
  name: 'Tech Corp',
  founded: new Date('2010-01-01'),
  employees: [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@techcorp.com',
      salary: 120000,
      department: 'Engineering',
      skills: [
        { name: 'JavaScript', level: 'expert', years: 8 },
        { name: 'Python', level: 'expert', years: 9 },
        { name: 'TypeScript', level: 'advanced', years: 5 },
        { name: 'React', level: 'expert', years: 6 },
      ],
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94105',
      },
      directReports: [],
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@techcorp.com',
      salary: 95000,
      department: 'Engineering',
      skills: [
        { name: 'Python', level: 'advanced', years: 4 },
        { name: 'Django', level: 'intermediate', years: 3 },
      ],
      address: {
        street: '456 Oak Ave',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        zipCode: '98101',
      },
      directReports: [],
    },
  ],
  departments: [
    {
      id: 1,
      name: 'Engineering',
      budget: 5000000,
      head: {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@techcorp.com',
        salary: 120000,
        department: 'Engineering',
        skills: [],
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          zipCode: '94105',
        },
        directReports: [],
      },
      teams: [
        {
          id: 1,
          name: 'Frontend Team',
          members: [],
          projects: [
            {
              id: 1,
              name: 'New UI Dashboard',
              status: 'active',
              deadline: new Date('2025-12-31'),
              budget: 250000,
              tags: ['ui', 'dashboard', 'react'],
            },
          ],
        },
      ],
    },
  ],
  headquarters: {
    street: '789 Corporate Blvd',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    zipCode: '94105',
  },
  metadata: {
    industry: 'Technology',
    revenue: 50000000,
    public: true,
    subsidiaries: [],
  },
};
