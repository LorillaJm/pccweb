'use client';

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, User, MessageSquare } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Address",
    content: ["Passi City, Iloilo Province", "Philippines 5037"],
    color: "text-red-600"
  },
  {
    icon: Phone,
    title: "Phone Numbers",
    content: ["(033) 396-1234", "(033) 396-5678", "Globe: +63 917 123 4567"],
    color: "text-green-600"
  },
  {
    icon: Mail,
    title: "Email Addresses",
    content: ["info@passicitycollege.edu.ph", "admissions@passicitycollege.edu.ph", "registrar@passicitycollege.edu.ph"],
    color: "text-blue-600"
  },
  {
    icon: Clock,
    title: "Office Hours",
    content: ["Monday - Friday: 8:00 AM - 5:00 PM", "Saturday: 8:00 AM - 12:00 PM", "Sunday: Closed"],
    color: "text-purple-600"
  }
];

const departments = [
  {
    name: "Admissions Office",
    phone: "(033) 396-1234",
    email: "admissions@passicitycollege.edu.ph",
    head: "Ms. Rosa Martinez"
  },
  {
    name: "Registrar's Office",
    phone: "(033) 396-2345",
    email: "registrar@passicitycollege.edu.ph",
    head: "Mr. Carlos Santos"
  },
  {
    name: "Student Affairs",
    phone: "(033) 396-3456",
    email: "studentaffairs@passicitycollege.edu.ph",
    head: "Prof. Ana Reyes"
  },
  {
    name: "Academic Affairs",
    phone: "(033) 396-4567",
    email: "academic@passicitycollege.edu.ph",
    head: "Dr. Juan Dela Cruz"
  },
  {
    name: "Financial Aid Office",
    phone: "(033) 396-5678",
    email: "financial@passicitycollege.edu.ph",
    head: "Ms. Maria Lopez"
  },
  {
    name: "IT Support",
    phone: "(033) 396-6789",
    email: "itsupport@passicitycollege.edu.ph",
    head: "Mr. Robert Garcia"
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    department: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        department: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl max-w-3xl mx-auto">
              We're here to help! Get in touch with us for any questions, 
              inquiries, or assistance you may need.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-600">Multiple ways to reach us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md text-center">
                  <div className={`w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`h-8 w-8 ${info.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{info.title}</h3>
                  <div className="space-y-1">
                    {info.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-gray-600 text-sm">{item}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:flex lg:gap-12">
          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-green-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent Successfully!</h3>
                  <p className="text-green-600">Thank you for contacting us. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+63 xxx xxx xxxx"
                      />
                    </div>
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select department</option>
                        <option value="admissions">Admissions Office</option>
                        <option value="registrar">Registrar's Office</option>
                        <option value="student-affairs">Student Affairs</option>
                        <option value="academic">Academic Affairs</option>
                        <option value="financial">Financial Aid Office</option>
                        <option value="it-support">IT Support</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief subject of your inquiry"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 mt-12 lg:mt-0">
            {/* Department Contacts */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Department Contacts</h3>
              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="font-semibold text-gray-900 mb-2">{dept.name}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {dept.head}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {dept.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {dept.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Need Immediate Help?</h3>
              <p className="text-gray-600 mb-4">
                For urgent matters, you can reach us directly:
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium">(033) 396-1234</div>
                    <div className="text-sm text-gray-600">Main Office</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium">+63 917 123 4567</div>
                    <div className="text-sm text-gray-600">SMS/Text</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Us</h2>
            <p className="text-gray-600">Visit our beautiful campus in Passi City</p>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Google Maps Embed - Replace with actual coordinates */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-16 w-16 mx-auto mb-4" />
                <div className="text-lg font-medium">Interactive Map</div>
                <div className="text-sm">Google Maps integration would be here</div>
                <div className="text-sm mt-2">
                  <strong>Address:</strong> Passi City, Iloilo Province, Philippines 5037
                </div>
              </div>
            </div>
          </div>

          {/* Directions */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">How to Get Here</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">By Bus</h4>
                <p className="text-gray-600 text-sm">
                  Take a Ceres Bus from Iloilo City to Passi City. The journey takes approximately 
                  1.5 hours. PCC is located near the city center.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">By Private Vehicle</h4>
                <p className="text-gray-600 text-sm">
                  From Iloilo City, take the Iloilo-Capiz Road (AH26) north to Passi City. 
                  The campus is easily accessible with parking available on-site.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}