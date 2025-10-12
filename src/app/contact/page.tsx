'use client';

import { useState } from "react";
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, User, MessageSquare, HeadphonesIcon, Globe, Users } from "lucide-react";

const floatingIcons = [
  { Icon: Phone, delay: 0, x: '16%', y: '26%' },
  { Icon: Mail, delay: 0.5, x: '84%', y: '21%' },
  { Icon: MapPin, delay: 1, x: '13%', y: '64%' },
  { Icon: HeadphonesIcon, delay: 1.5, x: '87%', y: '69%' },
  { Icon: Globe, delay: 2, x: '74%', y: '46%' },
  { Icon: Users, delay: 2.5, x: '23%', y: '51%' },
];

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
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50/50 to-indigo-100/30" />

          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <motion.div
            className="absolute top-1/4 left-1/6 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-cyan-400/20 via-blue-400/15 to-indigo-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute bottom-1/4 right-1/6 w-56 sm:w-72 lg:w-80 h-56 sm:h-72 lg:h-80 bg-gradient-to-r from-indigo-400/15 via-purple-400/10 to-pink-400/15 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -25, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {floatingIcons.map(({ Icon, delay, x, y }, index) => (
            <motion.div
              key={index}
              className="absolute hidden sm:block"
              style={{ left: x, top: y }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [0.8, 1.2, 0.8],
                rotate: [0, 360],
              }}
              transition={{
                duration: 12 + index * 2,
                repeat: Infinity,
                delay: delay,
                ease: 'easeInOut',
              }}
            >
              <Icon className="w-8 h-8 lg:w-12 lg:h-12 text-cyan-600/20" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-cyan-200 rounded-full text-cyan-700 font-medium text-sm mb-6 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <MessageSquare className="w-4 h-4" />
              We're Here to Help
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 px-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Contact Us
              </span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We're here to help! Get in touch with us for any questions,
              inquiries, or assistance you may need. Our dedicated team is ready to support you.
            </motion.p>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {[
                { number: '6', label: 'Departments' },
                { number: '24/7', label: 'Support' },
                { number: '<24h', label: 'Response Time' },
                { number: '100%', label: 'Satisfaction' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-600 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full font-semibold shadow-lg text-sm sm:text-base relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Send Message</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
              <motion.button
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-2 border-cyan-200 text-cyan-700 rounded-full font-semibold hover:bg-cyan-50 transition-all duration-300 text-sm sm:text-base shadow-lg"
                whileHover={{ scale: 1.05, borderColor: '#0891B2' }}
                whileTap={{ scale: 0.95 }}
              >
                Call Now
              </motion.button>
            </motion.div>
          </motion.div>
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
            {/* Interactive Google Maps Embed */}
            <div className="relative h-96 w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15715.234567890123!2d122.6333333!3d11.1083333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a53c2b1234567%3A0x1234567890abcdef!2sPassi%20City%2C%20Iloilo%2C%20Philippines!5e0!3m2!1sen!2sph!4v1234567890123!5m2!1sen!2sph"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Passi City College Location"
                className="rounded-lg"
              />

              {/* Map Overlay with College Info */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-bold text-gray-900">Passi City College</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Excellence in Education
                </p>
                <p className="text-xs text-gray-500">
                  Passi City, Iloilo Province<br />
                  Philippines 5037
                </p>
                <button
                  onClick={() => window.open('https://maps.google.com/?q=Passi+City+College,+Passi+City,+Iloilo,+Philippines', '_blank')}
                  className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                >
                  Open in Google Maps
                </button>
              </div>
            </div>
          </div>

          {/* Alternative Map Option */}
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Alternative Map View
              </h3>
              <p className="text-sm text-gray-600 mt-1">OpenStreetMap view of our location</p>
            </div>
            <div className="relative h-80 w-full">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=122.6200%2C11.0950%2C122.6500%2C11.1200&layer=mapnik&marker=11.1083%2C122.6333"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                title="Passi City College - OpenStreetMap"
                className="rounded-b-lg"
              />

              {/* OpenStreetMap Overlay */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <button
                  onClick={() => window.open('https://www.openstreetmap.org/?mlat=11.1083&mlon=122.6333#map=15/11.1083/122.6333', '_blank')}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors"
                >
                  View on OpenStreetMap
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Directions and Location Info */}
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h3 className="text-xl font-bold mb-2 flex items-center">
                <MapPin className="h-6 w-6 mr-2" />
                How to Get Here
              </h3>
              <p className="text-blue-100">Multiple transportation options to reach our campus</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* By Bus */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🚌</span>
                    </div>
                    <h4 className="font-semibold ml-3 text-blue-900">By Bus</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Take a <strong>Ceres Bus</strong> from Iloilo City to Passi City.
                    Journey time: <strong>~1.5 hours</strong>. PCC is located near the city center.
                  </p>
                  <div className="mt-3 text-xs text-blue-600">
                    <strong>Fare:</strong> ₱80-100 | <strong>Schedule:</strong> Every 30 minutes
                  </div>
                </div>

                {/* By Private Vehicle */}
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🚗</span>
                    </div>
                    <h4 className="font-semibold ml-3 text-green-900">By Private Vehicle</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    From Iloilo City, take the <strong>Iloilo-Capiz Road (AH26)</strong> north to Passi City.
                    Campus parking available on-site.
                  </p>
                  <div className="mt-3 text-xs text-green-600">
                    <strong>Distance:</strong> ~65 km | <strong>Travel Time:</strong> 1-1.5 hours
                  </div>
                </div>

                {/* By Air + Land */}
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✈️</span>
                    </div>
                    <h4 className="font-semibold ml-3 text-purple-900">By Air + Land</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Fly to <strong>Iloilo International Airport</strong>, then take a bus or private vehicle
                    to Passi City (additional 2 hours).
                  </p>
                  <div className="mt-3 text-xs text-purple-600">
                    <strong>Airport:</strong> Iloilo (ILO) | <strong>Total Time:</strong> 3-4 hours
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => window.open('https://maps.google.com/dir//Passi+City+College,+Passi+City,+Iloilo,+Philippines', '_blank')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </button>

                  <button
                    onClick={() => window.open('https://www.google.com/maps/search/hotels+near+Passi+City+College', '_blank')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    🏨 Nearby Hotels
                  </button>

                  <button
                    onClick={() => window.open('https://www.google.com/maps/search/restaurants+near+Passi+City', '_blank')}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    🍽️ Restaurants
                  </button>

                  <button
                    onClick={() => window.open('tel:+63333961234')}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    📞 Call Campus
                  </button>
                </div>
              </div>

              {/* Campus Landmarks */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Campus Landmarks & Nearby</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-blue-600 font-medium">🏛️ City Hall</div>
                    <div className="text-gray-600">500m away</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600 font-medium">🏥 Hospital</div>
                    <div className="text-gray-600">1.2km away</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-600 font-medium">🏪 Mall</div>
                    <div className="text-gray-600">800m away</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-600 font-medium">⛽ Gas Station</div>
                    <div className="text-gray-600">300m away</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}