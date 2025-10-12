import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Youtube, Instagram, Twitter, GraduationCap, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* College Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="font-bold text-lg">Passi City College</div>
                <div className="text-xs text-gray-300">Excellence in Education</div>
              </div>
            </div>
            <p className="text-gray-300 mb-4 text-sm">
              Committed to providing quality education and fostering academic excellence 
              in Passi City, Iloilo. We prepare students for successful careers and 
              meaningful contributions to society.
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition-colors duration-300"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-400 transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Academic Programs</span>
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Admissions</span>
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">News & Events</span>
                </Link>
              </li>
              <li>
                <Link href="/alumni" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Alumni</span>
                </Link>
              </li>
              <li>
                <Link href="/internships" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Internships</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-400">Student Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/portal/student" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Student Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/digital-id" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Digital ID</span>
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Events & Tickets</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Library</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Student Handbook</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Campus Map</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-400">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  Passi City, Iloilo Province<br />
                  Philippines 5037
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <a href="tel:+63333960000" className="text-gray-300 text-sm hover:text-yellow-400 transition-colors">
                  (033) 396-XXXX
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <a href="mailto:info@passicitycollege.edu.ph" className="text-gray-300 text-sm hover:text-yellow-400 transition-colors">
                  info@passicitycollege.edu.ph
                </a>
              </div>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-yellow-400 hover:text-yellow-300 text-sm font-semibold mt-2 group"
              >
                View on Map
                <ExternalLink className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Passi City College. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                Accessibility
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-500 text-xs">
              Developed with ❤️ for Passi City College
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}