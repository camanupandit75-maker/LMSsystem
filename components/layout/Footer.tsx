import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-4">
          <p className="font-semibold text-gray-900 dark:text-gray-100">Disclaimer</p>
          <p>
            The courses and content on ScholaPulse are created and owned by independent instructors. 
            ScholaPulse does not endorse, verify, or guarantee the accuracy of any course content. 
            Instructors are solely responsible for their content and any claims arising from it.
          </p>
          <p>
            We do not permit content that includes: religious propaganda, pornography, political campaigns, 
            hate speech, violence, illegal activities, or copyright violations. Any such content will be 
            removed immediately and may result in account termination.
          </p>
          <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Link href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/content-guidelines" className="text-purple-600 dark:text-purple-400 hover:underline">
              Content Guidelines
            </Link>
            <Link href="/instructor-agreement" className="text-purple-600 dark:text-purple-400 hover:underline">
              Instructor Agreement
            </Link>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 pt-4">
            © {new Date().getFullYear()} ScholaPulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}


