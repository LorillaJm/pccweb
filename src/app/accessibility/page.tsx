import React from 'react';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Accessibility Statement</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: October 2, 2025</p>

          <div className="prose prose-green max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment to Accessibility</h2>
              <p className="text-gray-700 leading-relaxed">
                We are committed to ensuring digital accessibility for all users, including those with 
                disabilities. We continually improve the user experience for everyone and apply relevant 
                accessibility standards to ensure our Campus Management System is accessible to all.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Conformance Standards</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Our Platform strives to conform to the following accessibility standards:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines</li>
                <li><strong>Section 508:</strong> U.S. Rehabilitation Act standards</li>
                <li><strong>ADA:</strong> Americans with Disabilities Act compliance</li>
                <li><strong>EN 301 549:</strong> European accessibility standard</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessibility Features</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Keyboard Navigation</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Full keyboard navigation support throughout the Platform</li>
                <li>Logical tab order for all interactive elements</li>
                <li>Visible focus indicators for keyboard users</li>
                <li>Skip navigation links to bypass repetitive content</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Screen Reader Compatibility</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Compatible with JAWS, NVDA, VoiceOver, and TalkBack</li>
                <li>Semantic HTML markup for proper content structure</li>
                <li>ARIA labels and landmarks for enhanced navigation</li>
                <li>Alternative text for all meaningful images</li>
                <li>Descriptive link text and button labels</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Visual Design</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>High contrast color schemes meeting WCAG AA standards (4.5:1 ratio)</li>
                <li>Resizable text up to 200% without loss of functionality</li>
                <li>Clear visual hierarchy and consistent layout</li>
                <li>Color is not the only means of conveying information</li>
                <li>Responsive design for various screen sizes and zoom levels</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Multimedia Content</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Captions for all video content</li>
                <li>Transcripts for audio content</li>
                <li>Audio descriptions where applicable</li>
                <li>Controls for pausing, stopping, and adjusting volume</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Forms and Input</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Clear labels for all form fields</li>
                <li>Error messages that are descriptive and helpful</li>
                <li>Input validation with clear feedback</li>
                <li>Sufficient time to complete forms with timeout warnings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Assistive Technologies Supported</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Our Platform is designed to work with the following assistive technologies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Screen Readers:</strong> JAWS, NVDA, VoiceOver, TalkBack, Narrator</li>
                <li><strong>Screen Magnification:</strong> ZoomText, MAGic, built-in OS magnifiers</li>
                <li><strong>Speech Recognition:</strong> Dragon NaturallySpeaking, Voice Control</li>
                <li><strong>Alternative Input Devices:</strong> Switch controls, eye-tracking systems</li>
                <li><strong>Browser Extensions:</strong> High contrast modes, text-to-speech tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Browser Compatibility</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                For the best accessible experience, we recommend using the latest versions of:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Google Chrome</li>
                <li>Mozilla Firefox</li>
                <li>Microsoft Edge</li>
                <li>Apple Safari</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Known Limitations</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                While we strive for full accessibility, we acknowledge the following areas where 
                improvements are ongoing:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Some third-party embedded content may not be fully accessible</li>
                <li>Certain PDF documents may require remediation for screen reader compatibility</li>
                <li>Complex data visualizations are being enhanced with alternative text descriptions</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                We are actively working to address these limitations and welcome your feedback.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessibility Testing</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We regularly test our Platform using:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Automated accessibility testing tools (axe, WAVE, Lighthouse)</li>
                <li>Manual testing with assistive technologies</li>
                <li>User testing with individuals who have disabilities</li>
                <li>Third-party accessibility audits</li>
                <li>Continuous monitoring and improvement processes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessibility Resources</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Campus Accessibility Services</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Students requiring accommodations should contact:
              </p>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-4">
                <p className="text-gray-700"><strong>Disability Services Office</strong></p>
                <p className="text-gray-700">Email: accessibility@campus.edu</p>
                <p className="text-gray-700">Phone: +1 (555) 123-4570</p>
                <p className="text-gray-700">Location: Student Services Building, Room 150</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Technical Support</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                For technical assistance with accessibility features:
              </p>
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <p className="text-gray-700"><strong>IT Accessibility Team</strong></p>
                <p className="text-gray-700">Email: it-accessibility@campus.edu</p>
                <p className="text-gray-700">Phone: +1 (555) 123-4571</p>
                <p className="text-gray-700">Hours: Monday-Friday, 8:00 AM - 6:00 PM</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                The following keyboard shortcuts are available throughout the Platform:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <ul className="space-y-2 text-gray-700">
                  <li><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Tab</kbd> - Navigate forward through interactive elements</li>
                  <li><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Shift + Tab</kbd> - Navigate backward</li>
                  <li><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Enter</kbd> or <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Space</kbd> - Activate buttons and links</li>
                  <li><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Esc</kbd> - Close modals and dialogs</li>
                  <li><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Arrow Keys</kbd> - Navigate within menus and lists</li>
                  <li><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Alt + H</kbd> - Return to homepage</li>
                  <li><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Alt + S</kbd> - Skip to main content</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Feedback and Complaints</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We welcome your feedback on the accessibility of our Platform. If you encounter 
                accessibility barriers, please let us know:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Describe the specific issue or barrier you encountered</li>
                <li>Include the page URL where the issue occurred</li>
                <li>Specify the assistive technology you were using (if applicable)</li>
                <li>Provide your contact information for follow-up</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                We aim to respond to accessibility feedback within 3 business days and will work 
                to resolve issues as quickly as possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Formal Complaints Process</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you are not satisfied with our response to your accessibility concern:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Submit a formal complaint to accessibility@campus.edu</li>
                <li>Include all relevant details and previous correspondence</li>
                <li>You will receive acknowledgment within 2 business days</li>
                <li>A full investigation will be completed within 10 business days</li>
                <li>You will receive a written response with proposed resolution</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ongoing Improvements</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We are committed to continuous improvement of accessibility:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Regular accessibility audits and testing</li>
                <li>Staff training on accessibility best practices</li>
                <li>Incorporating user feedback into development cycles</li>
                <li>Staying current with evolving accessibility standards</li>
                <li>Collaborating with disability advocacy groups</li>
                <li>Implementing new assistive technologies as they emerge</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Content</h2>
              <p className="text-gray-700 leading-relaxed">
                Some content on our Platform may be provided by third parties. While we encourage 
                all content providers to maintain accessibility standards, we cannot guarantee the 
                accessibility of third-party content. If you encounter inaccessible third-party 
                content, please report it to us so we can work with the provider to address the issue.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mobile Accessibility</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Our mobile applications and responsive web design include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Support for iOS VoiceOver and Android TalkBack</li>
                <li>Touch target sizes meeting minimum accessibility standards</li>
                <li>Gesture alternatives for all interactions</li>
                <li>Orientation support (portrait and landscape)</li>
                <li>Reduced motion options for users with vestibular disorders</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Document Accessibility</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Documents provided through the Platform (PDFs, Word documents, presentations) are 
                created following accessibility guidelines:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Proper heading structure and reading order</li>
                <li>Alternative text for images and graphics</li>
                <li>Accessible tables with proper headers</li>
                <li>Tagged PDFs for screen reader compatibility</li>
                <li>Sufficient color contrast in all materials</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                If you need a document in an alternative format, please contact accessibility@campus.edu
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                For questions, feedback, or assistance regarding accessibility:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700"><strong>Accessibility Coordinator</strong></p>
                <p className="text-gray-700">Email: accessibility@campus.edu</p>
                <p className="text-gray-700">Phone: +1 (555) 123-4570</p>
                <p className="text-gray-700">TTY: +1 (555) 123-4572</p>
                <p className="text-gray-700">Address: Campus Administration Building, Room 401</p>
                <p className="text-gray-700 mt-2">Office Hours: Monday-Friday, 8:00 AM - 5:00 PM</p>
              </div>
            </section>

            <section className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">
                This accessibility statement was last reviewed and updated on October 2, 2025. 
                We are committed to maintaining and improving the accessibility of our Platform 
                for all users.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
