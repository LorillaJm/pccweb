import { Users, Award, Building, Target } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Passi City College</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Founded on the principles of academic excellence, innovation, and community service, 
              Passi City College has been a beacon of higher education in Iloilo Province for over two decades.
            </p>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our History</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Established in 1999, Passi City College began as a vision to provide accessible, 
                  quality higher education to the people of Passi City and surrounding municipalities 
                  in Iloilo Province.
                </p>
                <p>
                  From humble beginnings with just three academic programs and 200 students, 
                  PCC has grown to become one of the most respected educational institutions 
                  in Western Visayas, now serving over 2,500 students across 15+ degree programs.
                </p>
                <p>
                  Throughout our journey, we have remained committed to our founding principles: 
                  academic excellence, character formation, and service to the community. 
                  Our graduates have gone on to become leaders in various fields, contributing 
                  to the development of the Philippines and beyond.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">Key Milestones</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <div className="font-semibold">1999</div>
                    <div className="text-gray-600">College founded with 3 programs</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <div className="font-semibold">2005</div>
                    <div className="text-gray-600">First batch of graduates</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <div className="font-semibold">2010</div>
                    <div className="text-gray-600">Expansion of campus facilities</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <div className="font-semibold">2015</div>
                    <div className="text-gray-600">Launched graduate programs</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</div>
                  <div>
                    <div className="font-semibold">2020</div>
                    <div className="text-gray-600">Digital transformation initiative</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Mission</h3>
              <p className="text-gray-600 text-center">
                To provide accessible, quality higher education that develops competent, 
                ethical, and globally competitive professionals who contribute to the 
                socio-economic development of our community and nation.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Vision</h3>
              <p className="text-gray-600 text-center">
                To be a premier institution of higher learning in Western Visayas, 
                recognized for academic excellence, innovative research, and community 
                engagement that transforms lives and builds a better society.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Core Values</h3>
              <div className="text-gray-600 text-center space-y-2">
                <div className="font-medium">Excellence</div>
                <div className="font-medium">Integrity</div>
                <div className="font-medium">Innovation</div>
                <div className="font-medium">Service</div>
                <div className="font-medium">Inclusivity</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-gray-600">
              Our dedicated leaders bring decades of experience in education, 
              administration, and community service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-200 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dr. Maria Santos</h3>
              <p className="text-blue-600 font-medium mb-3">College President</p>
              <p className="text-gray-600 text-sm">
                Ed.D. in Educational Leadership, 25+ years in higher education administration
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-200 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dr. Juan Dela Cruz</h3>
              <p className="text-blue-600 font-medium mb-3">Vice President for Academic Affairs</p>
              <p className="text-gray-600 text-sm">
                Ph.D. in Education, Former Department Chair, Research and Curriculum Specialist
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-200 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Prof. Ana Reyes</h3>
              <p className="text-blue-600 font-medium mb-3">VP for Student Affairs</p>
              <p className="text-gray-600 text-sm">
                M.A. in Student Personnel Administration, 20+ years in student development
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Accreditation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Accreditation & Recognition</h2>
            <p className="text-gray-600">
              PCC is recognized by leading educational bodies and maintains high standards 
              of academic excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">CHED Recognition</h3>
              <p className="text-gray-600 text-sm">
                All programs recognized by the Commission on Higher Education
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">AACCUP Accredited</h3>
              <p className="text-gray-600 text-sm">
                Accredited by the Accrediting Agency of Chartered Colleges and Universities
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">ISO 9001:2015</h3>
              <p className="text-gray-600 text-sm">
                Quality Management System certification for educational services
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Government Recognition</h3>
              <p className="text-gray-600 text-sm">
                Recognized by the Department of Education and local government units
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}