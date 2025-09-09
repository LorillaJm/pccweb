import { FileText, Calendar, DollarSign, CheckCircle, Download, User, GraduationCap } from "lucide-react";
import Link from "next/link";

const admissionSteps = [
  {
    step: 1,
    title: "Submit Application",
    description: "Complete and submit the online application form with required documents."
  },
  {
    step: 2,
    title: "Document Review",
    description: "Our admissions team will review your application and supporting documents."
  },
  {
    step: 3,
    title: "Entrance Examination",
    description: "Take the PCC entrance examination (if required for your program)."
  },
  {
    step: 4,
    title: "Interview",
    description: "Attend a personal interview with the admissions committee."
  },
  {
    step: 5,
    title: "Admission Decision",
    description: "Receive your admission decision via email and postal mail."
  },
  {
    step: 6,
    title: "Enrollment",
    description: "Complete enrollment process and pay required fees."
  }
];

const requirements = {
  freshmen: [
    "Senior High School Diploma or equivalent",
    "Official Transcript of Records",
    "Certificate of Good Moral Character",
    "Birth Certificate (PSA copy)",
    "2x2 ID Photos (4 pieces)",
    "Medical Certificate",
    "Completed Application Form"
  ],
  transferees: [
    "Official Transcript of Records from previous school",
    "Certificate of Transfer Credential",
    "Certificate of Good Moral Character",
    "Birth Certificate (PSA copy)",
    "2x2 ID Photos (4 pieces)",
    "Medical Certificate",
    "Completed Application Form"
  ],
  graduate: [
    "Bachelor's Degree Diploma",
    "Official Transcript of Records (Undergraduate)",
    "Certificate of Good Moral Character",
    "Birth Certificate (PSA copy)",
    "2x2 ID Photos (4 pieces)",
    "Medical Certificate",
    "Letter of Recommendation (2 copies)",
    "Statement of Purpose"
  ]
};

const scholarships = [
  {
    name: "Academic Excellence Scholarship",
    coverage: "Full Tuition",
    criteria: "Valedictorian/Salutatorian with 95% average"
  },
  {
    name: "Dean's List Scholarship",
    coverage: "50% Tuition Discount",
    criteria: "Consistent Dean's List for 2 consecutive semesters"
  },
  {
    name: "Leadership Scholarship",
    coverage: "25% Tuition Discount",
    criteria: "Outstanding leadership in student organizations"
  },
  {
    name: "Financial Aid Grant",
    coverage: "Variable",
    criteria: "Based on financial need and academic merit"
  }
];

export default function Admissions() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Admissions</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Join the PCC community and take the first step towards your future. 
              We make the admission process simple and transparent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#apply" 
                className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Apply Now
              </Link>
              <Link 
                href="#requirements" 
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
              >
                View Requirements
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Application Deadlines */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Deadlines</h2>
            <p className="text-gray-600">Important dates to remember for the upcoming academic year</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">First Semester</h3>
              <div className="text-gray-600">
                <div className="mb-1">Early Admission: March 1</div>
                <div className="mb-1">Regular Admission: May 15</div>
                <div className="text-red-600 font-medium">Final Deadline: June 30</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Second Semester</h3>
              <div className="text-gray-600">
                <div className="mb-1">Early Admission: October 1</div>
                <div className="mb-1">Regular Admission: November 15</div>
                <div className="text-red-600 font-medium">Final Deadline: December 15</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Summer Term</h3>
              <div className="text-gray-600">
                <div className="mb-1">Application Opens: February 1</div>
                <div className="mb-1">Regular Admission: March 15</div>
                <div className="text-red-600 font-medium">Final Deadline: April 15</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <GraduationCap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Graduate Programs</h3>
              <div className="text-gray-600">
                <div className="mb-1">First Semester: April 30</div>
                <div className="mb-1">Second Semester: November 30</div>
                <div className="text-blue-600 font-medium">Rolling Admission</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Admission Process</h2>
            <p className="text-gray-600">Follow these simple steps to complete your application</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {admissionSteps.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-600">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold ml-4">{item.title}</h3>
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section id="requirements" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Admission Requirements</h2>
            <p className="text-gray-600">Required documents for different student categories</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Freshmen */}
            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-6">Freshmen</h3>
              <ul className="space-y-3">
                {requirements.freshmen.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Transferees */}
            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-6">Transferees</h3>
              <ul className="space-y-3">
                {requirements.transferees.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Graduate Students */}
            <div className="bg-white rounded-lg p-8 shadow-md">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-6">Graduate Students</h3>
              <ul className="space-y-3">
                {requirements.graduate.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tuition and Fees */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tuition and Fees</h2>
            <p className="text-gray-600">Affordable education with flexible payment options</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Undergraduate</h3>
              <div className="text-2xl font-bold text-gray-900 mb-2">₱25,000</div>
              <div className="text-gray-600 text-sm">per semester</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Graduate</h3>
              <div className="text-2xl font-bold text-gray-900 mb-2">₱35,000</div>
              <div className="text-gray-600 text-sm">per semester</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Engineering</h3>
              <div className="text-2xl font-bold text-gray-900 mb-2">₱30,000</div>
              <div className="text-gray-600 text-sm">per semester</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Miscellaneous</h3>
              <div className="text-2xl font-bold text-gray-900 mb-2">₱5,000</div>
              <div className="text-gray-600 text-sm">per semester</div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              *Fees are subject to change. Financial aid and payment plans available.
            </p>
            <Link 
              href="/contact" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Financial Aid Office
            </Link>
          </div>
        </div>
      </section>

      {/* Scholarships */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Scholarships & Financial Aid</h2>
            <p className="text-gray-600">We believe education should be accessible to all qualified students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {scholarships.map((scholarship, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md border-l-4 border-yellow-400">
                <h3 className="text-xl font-semibold mb-3">{scholarship.name}</h3>
                <div className="mb-3">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {scholarship.coverage}
                  </span>
                </div>
                <p className="text-gray-600">{scholarship.criteria}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Forms */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Downloadable Forms</h2>
            <p className="text-gray-600">Download and complete these forms for your application</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <Download className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-3">Application Form</h3>
              <p className="text-gray-600 text-sm mb-4">Complete application form for all programs</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                Download PDF
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <Download className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-3">Medical Certificate Form</h3>
              <p className="text-gray-600 text-sm mb-4">Medical examination requirements</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                Download PDF
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <Download className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-3">Scholarship Application</h3>
              <p className="text-gray-600 text-sm mb-4">Apply for financial assistance</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="apply" className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Apply?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Take the next step in your educational journey. Our admissions team 
            is here to help you through every step of the process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              Start Your Application
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
            >
              Contact Admissions Office
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}