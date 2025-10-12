import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Effective Date: January 1, 2025 | Last Updated: January 1, 2025</p>

          <div className="prose prose-blue max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Passi City College - Excellence in Education ("we," "our," "us," or "the College"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational platform and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.1 Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We collect personal information that you voluntarily provide when registering or using our services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Name, email address, and contact information</li>
                <li>Student or employee ID number</li>
                <li>Academic information (courses, grades, enrollment status)</li>
                <li>Profile photos and biographical information</li>
                <li>Authentication credentials (encrypted passwords)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, features used)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Location data (if you grant permission)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Third-Party Information</h3>
              <p className="text-gray-700 leading-relaxed">
                We may receive information from third-party authentication providers (Google, Microsoft) 
                when you choose to sign in using those services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide, operate, and maintain our platform services</li>
                <li>Process registrations, enrollments, and event bookings</li>
                <li>Send important notifications about academic activities and events</li>
                <li>Personalize your experience and improve our services</li>
                <li>Communicate with you about updates, support, and administrative matters</li>
                <li>Analyze usage patterns to enhance platform functionality</li>
                <li>Ensure security and prevent fraud or unauthorized access</li>
                <li>Comply with legal obligations and institutional policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Within the Institution</h3>
              <p className="text-gray-700 leading-relaxed">
                Your information may be shared with authorized faculty, staff, and administrators 
                for legitimate educational purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Third-Party Service Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may share information with trusted service providers who assist us in:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Cloud hosting and data storage</li>
                <li>Email and notification services</li>
                <li>Analytics and performance monitoring</li>
                <li>Payment processing (for applicable services)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose your information when required by law, court order, or to protect 
                the rights, property, or safety of our institution, users, or others.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and session management</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and role-based permissions</li>
                <li>Secure backup and disaster recovery procedures</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                However, no method of transmission over the internet is 100% secure. While we strive 
                to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
                <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
                <li><strong>Data Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                To exercise these rights, please contact our Data Protection Officer at privacy@passicitycollege.edu.ph
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Performance Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences</li>
                <li><strong>Analytics Cookies:</strong> Provide insights for improvement</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes 
                outlined in this policy, comply with legal obligations, resolve disputes, and enforce 
                our agreements. Academic records are retained according to institutional and regulatory 
                requirements, typically for 5-7 years after graduation or departure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform is designed for use by students of appropriate age for higher education. 
                We do not knowingly collect information from individuals under 13 years of age. If you 
                believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country 
                of residence. We ensure appropriate safeguards are in place to protect your information 
                in accordance with this Privacy Policy and applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy periodically to reflect changes in our practices or 
                legal requirements. We will notify you of significant changes via email or platform 
                notification. Your continued use of the platform after changes constitutes acceptance 
                of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you have questions or concerns about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700"><strong>Data Protection Officer</strong></p>
                <p className="text-gray-700">Email: privacy@passicitycollege.edu.ph</p>
                <p className="text-gray-700">Phone: +63 (33) 596-XXXX</p>
                <p className="text-gray-700">Address: Passi City College, Passi City, Iloilo, Philippines</p>
              </div>
            </section>

            <section className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">
                This Privacy Policy is compliant with GDPR, CCPA, FERPA, and other applicable data 
                protection regulations. We are committed to transparency and protecting your privacy rights.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
