'use client';

import { Target, Eye, Star, Award, Users, Lightbulb } from 'lucide-react';

export function MissionVisionValues() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Foundation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built on strong principles that guide our commitment to excellence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Mission */}
          <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-blue-600">
            <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">🎯 Our Mission</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              To provide accessible, quality higher education that develops competent, 
              ethical, and globally competitive professionals who contribute to the 
              socio-economic development of Passi City, Iloilo Province, and the Philippines.
            </p>
          </div>

          {/* Vision */}
          <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-yellow-500">
            <div className="bg-yellow-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Eye className="h-10 w-10 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">👁️ Our Vision</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              To be a premier institution of higher learning in Western Visayas, 
              recognized for academic excellence, innovative research, and community 
              engagement that transforms lives and builds a better society.
            </p>
          </div>

          {/* Core Values */}
          <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-green-600">
            <div className="bg-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Star className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">⭐ Core Values</h3>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-center">
                <Award className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <span>Excellence in Education</span>
              </li>
              <li className="flex items-center">
                <Users className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <span>Integrity & Ethics</span>
              </li>
              <li className="flex items-center">
                <Lightbulb className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <span>Innovation & Creativity</span>
              </li>
              <li className="flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <span>Social Responsibility</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
