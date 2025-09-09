import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* College Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="font-bold text-lg">Passi City College</div>
                <div className="text-sm text-gray-300">Excellence in Education</div>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Committed to providing quality education and fostering academic excellence 
              in Passi City, Iloilo. We prepare students for successful careers and 
              meaningful contributions to society.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Academic Programs
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Admissions
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  News & Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  Passi City, Iloilo Province<br />
                  Philippines 5037
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-300 text-sm">(033) 396-XXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-300 text-sm">info@passicitycollege.edu.ph</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Passi City College. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}