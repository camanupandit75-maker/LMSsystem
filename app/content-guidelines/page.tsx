export default function ContentGuidelinesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Content Guidelines
      </h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="mb-4">
            ScholaPulse is committed to providing a safe and educational environment for all users. These content guidelines 
            outline what is and isn't allowed on our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Prohibited Content</h2>
          <p className="mb-4 font-semibold">The following types of content are strictly prohibited:</p>
          
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
              <h3 className="font-semibold mb-2">Religious Propaganda</h3>
              <p>Content that promotes or denigrates specific religious beliefs, practices, or organizations.</p>
            </div>

            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
              <h3 className="font-semibold mb-2">Pornography and Adult Content</h3>
              <p>Explicit sexual material, nudity, or adult-only content is not permitted.</p>
            </div>

            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
              <h3 className="font-semibold mb-2">Political Campaigns</h3>
              <p>Content designed to influence elections, promote political candidates, or advance political agendas.</p>
            </div>

            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
              <h3 className="font-semibold mb-2">Hate Speech</h3>
              <p>Content that promotes violence, discrimination, or hatred against individuals or groups based on race, 
                 ethnicity, religion, gender, sexual orientation, or other protected characteristics.</p>
            </div>

            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
              <h3 className="font-semibold mb-2">Violence</h3>
              <p>Graphic depictions of violence or content that incites violence against individuals or groups.</p>
            </div>

            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
              <h3 className="font-semibold mb-2">Illegal Activities</h3>
              <p>Content that promotes, describes, or facilitates illegal activities, including but not limited to fraud, 
                 theft, drug manufacturing, or other criminal acts.</p>
            </div>

            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
              <h3 className="font-semibold mb-2">Copyright Violations</h3>
              <p>Content that infringes on intellectual property rights, including unauthorized use of copyrighted material, 
                 trademarks, or other protected works.</p>
            </div>

            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
              <h3 className="font-semibold mb-2">Misinformation</h3>
              <p>Deliberately false or misleading information presented as fact, especially regarding health, science, 
                 or current events.</p>
            </div>

            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded">
              <h3 className="font-semibold mb-2">Spam and Scams</h3>
              <p>Fraudulent, deceptive, or spam content designed to mislead users or generate unauthorized revenue.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content Moderation</h2>
          <p className="mb-4">
            ScholaPulse reserves the right to review, moderate, and remove any content that violates these guidelines. 
            We may remove content without prior notice if we determine it violates our policies.
          </p>
          <p className="mb-4 font-semibold text-red-600">
            Violation of these guidelines will result in immediate content removal and may lead to account termination.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Reporting Violations</h2>
          <p className="mb-4">
            If you encounter content that violates these guidelines, please report it through our support channels. 
            We take all reports seriously and will investigate promptly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Appeals Process</h2>
          <p className="mb-4">
            If you believe your content was removed in error, you may appeal the decision through our support channels. 
            We will review your appeal and respond within a reasonable timeframe.
          </p>
        </section>
      </div>
    </div>
  )
}





