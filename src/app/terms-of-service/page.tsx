import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Effective Date: January 1, 2025 | Last Updated: January 1, 2025</p>

          <div className="prose prose-indigo max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the Passi City College - Excellence in Education platform ("Platform," "Service," "we," "us," "our," or "the College"), you ("User," "you," or "your") accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility and Account Registration</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.1 Eligibility</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                You must be:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>A currently enrolled student, faculty member, staff, or authorized alumni</li>
                <li>At least 18 years of age or have parental/guardian consent</li>
                <li>Capable of forming a binding contract under applicable law</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Account Security</h3>
              <p className="text-gray-700 leading-relaxed mb-3">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your password and account credentials</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Not share your account with others or allow others to access your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Acceptable Use Policy</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.1 Permitted Uses</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                The Platform is provided for legitimate educational and administrative purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Course enrollment and academic management</li>
                <li>Event registration and campus activities</li>
                <li>Communication with faculty, staff, and peers</li>
                <li>Access to educational resources and materials</li>
                <li>Career services and alumni networking</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Prohibited Activities</h3>
              <p className="text-gray-700 leading-relaxed mb-3">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Violate any applicable laws, regulations, or institutional policies</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Upload or transmit viruses, malware, or malicious code</li>
                <li>Attempt to gain unauthorized access to systems or data</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Post false, misleading, or defamatory content</li>
                <li>Use automated systems (bots, scrapers) without authorization</li>
                <li>Interfere with or disrupt the Platform's operation</li>
                <li>Sell, transfer, or sublicense your account</li>
                <li>Use the Platform for commercial purposes without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Intellectual Property Rights</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Platform Content</h3>
              <p className="text-gray-700 leading-relaxed">
                All content, features, and functionality of the Platform, including but not limited to 
                text, graphics, logos, icons, images, audio clips, video clips, data compilations, and 
                software, are the exclusive property of the institution or its licensors and are protected 
                by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 User Content</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                By submitting content to the Platform, you grant us a non-exclusive, worldwide, royalty-free 
                license to use, reproduce, modify, and display such content for the purpose of operating and 
                improving the Platform. You retain ownership of your content and are responsible for ensuring 
                you have the necessary rights to share it.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Academic Integrity</h3>
              <p className="text-gray-700 leading-relaxed">
                All academic work submitted through the Platform must be your own original work. Plagiarism, 
                cheating, or any form of academic dishonesty is strictly prohibited and may result in 
                disciplinary action.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Services and Features</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.1 Service Availability</h3>
              <p className="text-gray-700 leading-relaxed">
                We strive to maintain continuous availability of the Platform but do not guarantee 
                uninterrupted access. We may suspend or modify services for maintenance, updates, or 
                other operational reasons with or without notice.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Event Registration and Tickets</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                When registering for events:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Registration confirmations are subject to availability</li>
                <li>Digital tickets are non-transferable unless explicitly stated</li>
                <li>Cancellation policies vary by event and will be clearly communicated</li>
                <li>You are responsible for presenting valid tickets for entry</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Notifications</h3>
              <p className="text-gray-700 leading-relaxed">
                By using the Platform, you consent to receive notifications via email, SMS, push 
                notifications, or in-app messages regarding your account, academic activities, and 
                important announcements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of the Platform is also governed by our Privacy Policy, which is incorporated 
                into these Terms by reference. Please review our Privacy Policy to understand how we 
                collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimers and Limitations of Liability</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.1 "As Is" Basis</h3>
              <p className="text-gray-700 leading-relaxed">
                THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF 
                ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF 
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.2 Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE INSTITUTION SHALL NOT BE LIABLE FOR ANY 
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF 
                PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, 
                USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE PLATFORM.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.3 Third-Party Links</h3>
              <p className="text-gray-700 leading-relaxed">
                The Platform may contain links to third-party websites or services. We are not responsible 
                for the content, privacy policies, or practices of any third-party sites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless the institution, its officers, directors, 
                employees, and agents from any claims, liabilities, damages, losses, and expenses, including 
                reasonable attorneys' fees, arising out of or in any way connected with your access to or 
                use of the Platform, your violation of these Terms, or your violation of any rights of another.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.1 By You</h3>
              <p className="text-gray-700 leading-relaxed">
                You may terminate your account at any time by contacting support, subject to completion 
                of any ongoing academic obligations.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.2 By Us</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We reserve the right to suspend or terminate your account immediately, without prior 
                notice, if you:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Pose a security risk to the Platform or other users</li>
                <li>Are no longer affiliated with the institution</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.3 Effect of Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                Upon termination, your right to use the Platform will immediately cease. Provisions 
                regarding intellectual property, disclaimers, indemnification, and limitations of 
                liability shall survive termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Dispute Resolution</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">10.1 Governing Law</h3>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">10.2 Dispute Resolution Process</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                In the event of any dispute:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>First, contact our support team to attempt informal resolution</li>
                <li>If unresolved, disputes may be submitted to mediation</li>
                <li>Legal action must be brought within one year of the claim arising</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material 
                changes via email or platform notification at least 30 days before the changes take effect. 
                Your continued use of the Platform after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. General Provisions</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.1 Entire Agreement</h3>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between 
                you and the institution regarding the Platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.2 Severability</h3>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be unenforceable, the remaining provisions 
                will remain in full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.3 Waiver</h3>
              <p className="text-gray-700 leading-relaxed">
                No waiver of any term shall be deemed a further or continuing waiver of such term or 
                any other term.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.4 Assignment</h3>
              <p className="text-gray-700 leading-relaxed">
                You may not assign or transfer these Terms without our prior written consent. We may 
                assign these Terms without restriction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                For questions about these Terms of Service, please contact:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700"><strong>Legal Department</strong></p>
                <p className="text-gray-700">Email: legal@passicitycollege.edu.ph</p>
                <p className="text-gray-700">Phone: +63 (33) 596-XXXX</p>
                <p className="text-gray-700">Address: Passi City College, Passi City, Iloilo, Philippines</p>
                <p className="text-gray-700">Business Hours: Monday - Friday, 8:00 AM - 5:00 PM (PHT)</p>
              </div>
            </section>

            <section className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">
                By using the Passi City College - Excellence in Education platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
