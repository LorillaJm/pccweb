import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'program' | 'news' | 'event' | 'page';
  url: string;
  category?: string;
}

// Searchable content database
const searchableContent: SearchResult[] = [
  // Programs
  {
    id: 'prog-1',
    title: 'Bachelor of Science in Computer Science',
    description: 'Comprehensive program covering software development, algorithms, and computer systems.',
    type: 'program',
    url: '/programs#computer-science',
    category: 'Technology'
  },
  {
    id: 'prog-2',
    title: 'Bachelor of Science in Business Administration',
    description: 'Learn management, finance, marketing, and entrepreneurship skills.',
    type: 'program',
    url: '/programs#business-admin',
    category: 'Business'
  },
  {
    id: 'prog-3',
    title: 'Bachelor of Science in Nursing',
    description: 'Professional nursing education with clinical practice and patient care training.',
    type: 'program',
    url: '/programs#nursing',
    category: 'Healthcare'
  },
  {
    id: 'prog-4',
    title: 'Bachelor of Elementary Education',
    description: 'Prepare to become a professional elementary school teacher.',
    type: 'program',
    url: '/programs#elementary-education',
    category: 'Education'
  },
  {
    id: 'prog-5',
    title: 'Bachelor of Science in Civil Engineering',
    description: 'Study structural design, construction management, and infrastructure development.',
    type: 'program',
    url: '/programs#civil-engineering',
    category: 'Engineering'
  },
  
  // Pages
  {
    id: 'page-1',
    title: 'About Us',
    description: 'Learn about our history, mission, vision, and values.',
    type: 'page',
    url: '/about'
  },
  {
    id: 'page-2',
    title: 'Admissions',
    description: 'Information about enrollment, requirements, and application process.',
    type: 'page',
    url: '/admissions'
  },
  {
    id: 'page-3',
    title: 'Contact Us',
    description: 'Get in touch with us - location, phone, email, and contact form.',
    type: 'page',
    url: '/contact'
  },
  {
    id: 'page-4',
    title: 'Student Portal',
    description: 'Access your grades, schedules, and student information.',
    type: 'page',
    url: '/portal/student'
  },
  {
    id: 'page-5',
    title: 'Alumni Network',
    description: 'Connect with fellow alumni, find mentors, and explore job opportunities.',
    type: 'page',
    url: '/alumni'
  },
  {
    id: 'page-6',
    title: 'Internship Opportunities',
    description: 'Browse and apply for internship positions from partner companies.',
    type: 'page',
    url: '/internships'
  },
  {
    id: 'page-7',
    title: 'Digital ID Card',
    description: 'Access your digital student ID and campus access QR code.',
    type: 'page',
    url: '/digital-id'
  },
  
  // News
  {
    id: 'news-1',
    title: 'New Library Building Opens',
    description: 'State-of-the-art library facility now open with modern study spaces and digital resources.',
    type: 'news',
    url: '/news#library-opening',
    category: 'Campus'
  },
  {
    id: 'news-2',
    title: 'Research Grant Awarded',
    description: 'Faculty receives major research grant for innovative technology project.',
    type: 'news',
    url: '/news#research-grant',
    category: 'Research'
  },
  {
    id: 'news-3',
    title: 'Student Achievement Awards',
    description: 'Outstanding students recognized for academic excellence and community service.',
    type: 'news',
    url: '/news#student-awards',
    category: 'Students'
  },
  
  // Events
  {
    id: 'event-1',
    title: 'Annual Career Fair',
    description: 'Meet with top employers and explore career opportunities. Register now!',
    type: 'event',
    url: '/events#career-fair',
    category: 'Career'
  },
  {
    id: 'event-2',
    title: 'Tech Innovation Summit',
    description: 'Join industry leaders discussing the latest in technology and innovation.',
    type: 'event',
    url: '/events#tech-summit',
    category: 'Technology'
  },
  {
    id: 'event-3',
    title: 'Cultural Festival',
    description: 'Celebrate diversity with performances, food, and cultural exhibitions.',
    type: 'event',
    url: '/events#cultural-festival',
    category: 'Culture'
  },
  {
    id: 'event-4',
    title: 'Open House Day',
    description: 'Tour our campus, meet faculty, and learn about our programs.',
    type: 'event',
    url: '/events#open-house',
    category: 'Admissions'
  },
];

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q')?.toLowerCase().trim();

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Search algorithm with relevance scoring
    const results = searchableContent
      .map(item => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const descLower = item.description.toLowerCase();
        const categoryLower = item.category?.toLowerCase() || '';

        // Exact title match (highest priority)
        if (titleLower === query) {
          score += 100;
        }
        // Title starts with query
        else if (titleLower.startsWith(query)) {
          score += 50;
        }
        // Title contains query
        else if (titleLower.includes(query)) {
          score += 30;
        }

        // Description contains query
        if (descLower.includes(query)) {
          score += 20;
        }

        // Category matches
        if (categoryLower.includes(query)) {
          score += 15;
        }

        // Word boundary matches (whole word)
        const queryWords = query.split(' ');
        queryWords.forEach(word => {
          const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
          if (wordRegex.test(titleLower)) score += 10;
          if (wordRegex.test(descLower)) score += 5;
        });

        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8) // Limit to top 8 results
      .map(({ score, ...item }) => item); // Remove score from final results

    return NextResponse.json({ 
      results,
      query,
      count: results.length 
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}
