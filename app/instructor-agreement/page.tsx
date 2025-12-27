export default function InstructorAgreementPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Instructor Agreement
      </h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">1. Content Responsibility</h2>
              <p className="mb-4">
                As an instructor on ScholaPulse, you are solely responsible for all content you create, upload, or publish. 
                This includes but is not limited to course materials, videos, descriptions, and any associated resources.
              </p>
              <p className="mb-4">
                ScholaPulse does not endorse, verify, or guarantee the accuracy, completeness, or quality of any course content. 
                You represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>All content is original or you have obtained all necessary rights and permissions</li>
                <li>Content does not infringe on any third-party intellectual property rights</li>
                <li>Content is accurate and not misleading</li>
                <li>You have the legal right to publish and distribute the content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">2. Prohibited Content</h2>
              <p className="mb-4">
                You agree NOT to upload, publish, or distribute any content that includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li><strong>Religious Propaganda:</strong> Content that promotes or denigrates specific religious beliefs</li>
                <li><strong>Pornography or Adult Content:</strong> Explicit sexual material or adult-only content</li>
                <li><strong>Political Campaigns:</strong> Content designed to influence elections or political outcomes</li>
                <li><strong>Hate Speech:</strong> Content that promotes violence, discrimination, or hatred against individuals or groups</li>
                <li><strong>Violence:</strong> Graphic depictions of violence or content that incites violence</li>
                <li><strong>Illegal Activities:</strong> Content that promotes, describes, or facilitates illegal activities</li>
                <li><strong>Copyright Violations:</strong> Content that infringes on intellectual property rights</li>
                <li><strong>Misinformation:</strong> Deliberately false or misleading information</li>
                <li><strong>Spam or Scams:</strong> Fraudulent, deceptive, or spam content</li>
              </ul>
              <p className="mb-4 font-semibold text-red-600">
                Violation of these terms will result in immediate content removal and may lead to account termination.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">3. Content Moderation</h2>
              <p className="mb-4">
                ScholaPulse reserves the right to review, moderate, and remove any content that violates these terms or 
                our community guidelines. We may remove content without prior notice if we determine it violates this agreement.
              </p>
              <p className="mb-4">
                You agree to cooperate with our moderation process and to promptly address any concerns raised about your content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">4. Intellectual Property</h2>
              <p className="mb-4">
                You retain all ownership rights to your content. By uploading content to ScholaPulse, you grant us a 
                non-exclusive, worldwide, royalty-free license to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Host, store, and display your content on the platform</li>
                <li>Distribute your content to enrolled students</li>
                <li>Use your content for marketing and promotional purposes (with attribution)</li>
                <li>Create backups and ensure platform functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">5. Student Interactions</h2>
              <p className="mb-4">
                You agree to maintain professional and respectful interactions with students. You will not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Harass, abuse, or discriminate against students</li>
                <li>Request personal information beyond what is necessary for course delivery</li>
                <li>Use student data for purposes other than course delivery</li>
                <li>Engage in any form of inappropriate communication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">6. Platform Rules and Guidelines</h2>
              <p className="mb-4">
                You agree to comply with all ScholaPulse platform rules, terms of service, and community guidelines. 
                These may be updated from time to time, and continued use of the platform constitutes acceptance of updates.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">7. Liability and Indemnification</h2>
              <p className="mb-4">
                You agree to indemnify and hold harmless ScholaPulse, its affiliates, and their respective officers, 
                directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including 
                legal fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Your content or use of the platform</li>
                <li>Violation of this agreement or any applicable laws</li>
                <li>Infringement of third-party rights</li>
                <li>Any claims made by students regarding your content</li>
              </ul>
              <p className="mb-4">
                ScholaPulse provides the platform "as is" and makes no warranties regarding the platform's availability, 
                functionality, or suitability for your purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">8. Termination</h2>
              <p className="mb-4">
                Either party may terminate this agreement at any time. ScholaPulse may terminate your access immediately 
                if you violate this agreement. Upon termination, your content may be removed, but enrolled students will 
                retain access to courses they have already purchased.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">9. Dispute Resolution</h2>
              <p className="mb-4">
                Any disputes arising from this agreement will be resolved through binding arbitration in accordance with 
                applicable laws. You waive your right to participate in class-action lawsuits.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">10. Acceptance</h2>
              <p className="mb-4">
                By accepting this agreement, you acknowledge that you have read, understood, and agree to be bound by all 
                terms and conditions stated above.
              </p>
              <p className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
                This agreement is a legally binding contract. Please read it carefully before accepting.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}


