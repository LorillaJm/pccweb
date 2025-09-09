import Link from "next/link";
import { ChevronRight, Calendar, Users, BookOpen, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(30, 58, 138, 0.8), rgba(29, 78, 216, 0.8)), url("https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1586&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-yellow-400">Passi City College</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Shaping Tomorrow's Leaders Through Excellence in Education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/admissions" 
                className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center"
              >
                Apply Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/programs" 
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">2,500+</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">15+</div>
              <div className="text-gray-600">Programs</div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">150+</div>
              <div className="text-gray-600">Faculty</div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">25+</div>
              <div className="text-gray-600">Years of Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To provide accessible, quality higher education that develops competent, 
                ethical, and globally competitive professionals who contribute to the 
                socio-economic development of Passi City, Iloilo Province, and the Philippines.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To be a premier institution of higher learning in Western Visayas, 
                recognized for academic excellence, innovative research, and community 
                engagement that transforms lives and builds a better society.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Announcements</h2>
            <p className="text-gray-600">Stay updated with the latest news and events at PCC</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-500">December 15, 2024</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Spring 2025 Enrollment Now Open</h3>
                <p className="text-gray-600 mb-4">
                  Registration for the Spring 2025 semester is now open. Secure your spot 
                  in your preferred program today.
                </p>
                <Link href="/news" className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center">
                  Read More
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-500">December 10, 2024</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Annual Awards Ceremony 2024</h3>
                <p className="text-gray-600 mb-4">
                  Join us in celebrating our outstanding students and faculty members 
                  at our Annual Awards Ceremony.
                </p>
                <Link href="/news" className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center">
                  Read More
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-500">December 5, 2024</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">New Computer Laboratory Opens</h3>
                <p className="text-gray-600 mb-4">
                  State-of-the-art computer laboratory with the latest technology 
                  is now available for student use.
                </p>
                <Link href="/news" className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center">
                  Read More
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/news" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All News & Events
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Take the first step towards your future. Join the PCC community and 
            unlock your potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/admissions" 
              className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Apply for Admission
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
