import { Calendar, Clock, ChevronRight, Tag, User } from "lucide-react";
import Link from "next/link";

const featuredNews = {
  title: "PCC Celebrates 25th Founding Anniversary",
  date: "December 20, 2024",
  category: "College News",
  excerpt: "Passi City College marks a significant milestone as it celebrates 25 years of excellence in education. The grand celebration featured various activities including cultural shows, academic competitions, and alumni homecoming.",
  image: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  content: "Full story content would be here..."
};

const newsArticles = [
  {
    id: 1,
    title: "Spring 2025 Enrollment Now Open",
    date: "December 15, 2024",
    category: "Admissions",
    excerpt: "Registration for the Spring 2025 semester is now open. Secure your spot in your preferred program today.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "Admissions Office"
  },
  {
    id: 2,
    title: "Annual Awards Ceremony 2024",
    date: "December 10, 2024",
    category: "Events",
    excerpt: "Join us in celebrating our outstanding students and faculty members at our Annual Awards Ceremony.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "Student Affairs"
  },
  {
    id: 3,
    title: "New Computer Laboratory Opens",
    date: "December 5, 2024",
    category: "Facilities",
    excerpt: "State-of-the-art computer laboratory with the latest technology is now available for student use.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "IT Department"
  },
  {
    id: 4,
    title: "PCC Students Excel in Regional Competition",
    date: "November 28, 2024",
    category: "Achievements",
    excerpt: "Computer Science students from PCC won first place in the Regional Programming Competition held in Iloilo City.",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "Academic Affairs"
  },
  {
    id: 5,
    title: "Community Outreach Program Launched",
    date: "November 20, 2024",
    category: "Community",
    excerpt: "PCC launches comprehensive community outreach program focusing on education and health services for remote areas.",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "Extension Services"
  },
  {
    id: 6,
    title: "Faculty Development Workshop Series",
    date: "November 15, 2024",
    category: "Faculty",
    excerpt: "Monthly faculty development workshops focusing on modern teaching methodologies and research techniques.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    author: "Human Resources"
  }
];

const upcomingEvents = [
  {
    title: "Graduation Ceremony",
    date: "March 15, 2025",
    time: "9:00 AM",
    location: "PCC Gymnasium",
    description: "Commencement exercises for Class of 2025"
  },
  {
    title: "Research Conference",
    date: "February 20, 2025",
    time: "8:00 AM",
    location: "Conference Hall",
    description: "Annual student and faculty research presentation"
  },
  {
    title: "Sports Festival",
    date: "February 10-14, 2025",
    time: "All Day",
    location: "Campus Grounds",
    description: "Inter-college sports competition and activities"
  },
  {
    title: "Career Fair",
    date: "January 25, 2025",
    time: "10:00 AM",
    location: "Main Auditorium",
    description: "Job opportunities and career guidance for students"
  }
];

const categories = ["All", "College News", "Admissions", "Events", "Facilities", "Achievements", "Community", "Faculty"];

export default function News() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">News & Events</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Stay updated with the latest news, announcements, and upcoming events 
              at Passi City College.
            </p>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="lg:flex">
              <div className="lg:w-1/2">
                <img 
                  src={featuredNews.image} 
                  alt={featuredNews.title}
                  className="w-full h-64 lg:h-full object-cover"
                />
              </div>
              <div className="lg:w-1/2 p-8">
                <div className="flex items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {featuredNews.category}
                  </span>
                  <div className="flex items-center ml-4 text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {featuredNews.date}
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {featuredNews.title}
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  {featuredNews.excerpt}
                </p>
                <Link 
                  href="/news/featured" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  Read Full Story
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:flex lg:gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Category Filter */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest News</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category === "All" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* News Articles */}
            <div className="space-y-8">
              {newsArticles.map((article) => (
                <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-center mb-3">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                          <Tag className="h-3 w-3 mr-1 inline" />
                          {article.category}
                        </span>
                        <div className="flex items-center ml-4 text-gray-500 text-sm">
                          <User className="h-4 w-4 mr-1" />
                          {article.author}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center mb-3 text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {article.date}
                      </div>
                      <p className="text-gray-600 mb-4">
                        {article.excerpt}
                      </p>
                      <Link 
                        href={`/news/${article.id}`} 
                        className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
                      >
                        Read More
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                  Previous
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  1
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                  2
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                  3
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 mt-12 lg:mt-0">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
                    <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {event.time}
                    </div>
                    <div className="text-gray-500 text-sm mb-2">📍 {event.location}</div>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link 
                  href="/events" 
                  className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
                >
                  View All Events
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/admissions" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Admission Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/programs" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Academic Programs
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Contact Information
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                    About PCC
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Stay Updated</h3>
              <p className="text-gray-600 mb-4">
                Subscribe to our newsletter to receive the latest news and announcements.
              </p>
              <form className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}