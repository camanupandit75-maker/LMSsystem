export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Terms of Service
      </h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using ScholaPulse, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily access the materials on ScholaPulse for personal, non-commercial transitory viewing only.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility 
            for all activities that occur under your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Content Responsibility</h2>
          <p className="mb-4">
            Instructors are solely responsible for their course content. ScholaPulse does not endorse or verify the accuracy of 
            any course materials.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
          <p className="mb-4">You may not use ScholaPulse:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>In any way that violates any applicable law or regulation</li>
            <li>To transmit any material that is defamatory, offensive, or objectionable</li>
            <li>To engage in any unauthorized commercial activities</li>
            <li>To attempt to gain unauthorized access to any portion of the platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <p className="mb-4">
            The content on ScholaPulse, including but not limited to text, graphics, logos, and software, is the property of 
            ScholaPulse or its content suppliers and is protected by copyright laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p className="mb-4">
            ScholaPulse shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting 
            from your use of or inability to use the platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p className="mb-4">
            ScholaPulse reserves the right to revise these terms at any time. By continuing to use the platform after changes 
            are made, you agree to be bound by the revised terms.
          </p>
        </section>
      </div>
    </div>
  )
}

