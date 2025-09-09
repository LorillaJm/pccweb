import { BookOpen, Users, Clock, Award, ChevronRight } from "lucide-react";
import Link from "next/link";

const programs = [
  {
    category: "Business & Management",
    programs: [
      {
        title: "Bachelor of Science in Business Administration",
        major: "Management",
        duration: "4 years",
        units: "120 units",
        description: "Develops strategic thinking and leadership skills for modern business environments."
      },
      {
        title: "Bachelor of Science in Business Administration",
        major: "Marketing",
        duration: "4 years",
        units: "120 units",
        description: "Focuses on consumer behavior, digital marketing, and brand management."
      },
      {
        title: "Bachelor of Science in Accountancy",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Prepares students for CPA licensure and careers in accounting and finance."
      }
    ]
  },
  {
    category: "Information Technology",
    programs: [
      {
        title: "Bachelor of Science in Information Technology",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Covers software development, network administration, and cybersecurity."
      },
      {
        title: "Bachelor of Science in Computer Science",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Emphasizes programming, algorithms, and system design."
      }
    ]
  },
  {
    category: "Engineering",
    programs: [
      {
        title: "Bachelor of Science in Civil Engineering",
        major: "",
        duration: "5 years",
        units: "150 units",
        description: "Focuses on infrastructure design, construction, and project management."
      },
      {
        title: "Bachelor of Science in Electrical Engineering",
        major: "",
        duration: "5 years",
        units: "150 units",
        description: "Covers power systems, electronics, and telecommunications."
      }
    ]
  },
  {
    category: "Education",
    programs: [
      {
        title: "Bachelor of Elementary Education",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Prepares teachers for elementary education with modern pedagogical approaches."
      },
      {
        title: "Bachelor of Secondary Education",
        major: "Various Specializations",
        duration: "4 years",
        units: "120 units",
        description: "Specializations in Mathematics, English, Science, and Social Studies."
      }
    ]
  },
  {
    category: "Health Sciences",
    programs: [
      {
        title: "Bachelor of Science in Nursing",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Comprehensive nursing education with clinical experience."
      },
      {
        title: "Bachelor of Science in Medical Technology",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Laboratory medicine and diagnostic procedures."
      }
    ]
  },
  {
    category: "Liberal Arts",
    programs: [
      {
        title: "Bachelor of Arts in Communication",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Media studies, journalism, and corporate communication."
      },
      {
        title: "Bachelor of Arts in Psychology",
        major: "",
        duration: "4 years",
        units: "120 units",
        description: "Human behavior, counseling, and psychological assessment."
      }
    ]
  }
];

const graduatePrograms = [
  {
    title: "Master of Business Administration (MBA)",
    duration: "2 years",
    units: "36 units",
    description: "Advanced business management with leadership development."
  },
  {
    title: "Master of Arts in Education (MAEd)",
    duration: "2 years",
    units: "36 units",
    description: "Advanced educational theory and administration."
  },
  {
    title: "Master of Science in Information Technology (MSIT)",
    duration: "2 years",
    units: "36 units",
    description: "Advanced IT concepts and emerging technologies."
  }
];

export default function Programs() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Academic Programs</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Discover our comprehensive range of undergraduate and graduate programs 
              designed to prepare you for success in your chosen career.
            </p>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">15+</div>
              <div className="text-gray-600">Undergraduate Programs</div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">3</div>
              <div className="text-gray-600">Graduate Programs</div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">150+</div>
              <div className="text-gray-600">Qualified Faculty</div>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">95%</div>
              <div className="text-gray-600">Employment Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Undergraduate Programs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Undergraduate Programs</h2>
            <p className="text-gray-600">
              Choose from our diverse selection of four-year bachelor's degree programs
            </p>
          </div>

          <div className="space-y-12">
            {programs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b-2 border-blue-900 pb-2">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.programs.map((program, programIndex) => (
                    <div key={programIndex} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {program.title}
                      </h4>
                      {program.major && (
                        <p className="text-blue-600 font-medium mb-3">Major in {program.major}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {program.duration}
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {program.units}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{program.description}</p>
                      <Link 
                        href="/admissions" 
                        className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center"
                      >
                        Learn More
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Graduate Programs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Graduate Programs</h2>
            <p className="text-gray-600">
              Advance your career with our master's degree programs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {graduatePrograms.map((program, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-md border border-gray-200">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {program.title}
                </h3>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {program.duration}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {program.units}
                  </div>
                </div>
                <p className="text-gray-600 text-center mb-6">{program.description}</p>
                <div className="text-center">
                  <Link 
                    href="/admissions" 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                  >
                    Apply Now
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose PCC Programs?</h2>
            <p className="text-gray-600">
              Our programs are designed with your success in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Industry-Relevant Curriculum</h3>
              <p className="text-gray-600">
                Our programs are regularly updated to meet current industry standards 
                and emerging market demands.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Experienced Faculty</h3>
              <p className="text-gray-600">
                Learn from qualified professors with advanced degrees and 
                extensive professional experience.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Modern Facilities</h3>
              <p className="text-gray-600">
                State-of-the-art laboratories, libraries, and learning spaces 
                equipped with the latest technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Academic Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Explore our admission requirements and take the first step towards 
            your future career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/admissions" 
              className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              View Admission Requirements
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
            >
              Schedule a Campus Tour
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}