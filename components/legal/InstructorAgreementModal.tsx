'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { acceptInstructorAgreement } from '@/app/instructor/actions'
import { X, Scroll } from 'lucide-react'

interface InstructorAgreementModalProps {
  onAccept: () => void
  onCancel: () => void
}

export default function InstructorAgreementModal({ onAccept, onCancel }: InstructorAgreementModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkScroll = () => {
      if (!scrollContainerRef.current || !contentRef.current) return

      const container = scrollContainerRef.current
      const content = contentRef.current
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight

      // Check if scrolled to bottom (with 50px threshold)
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50
      setHasScrolledToBottom(isAtBottom)
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      // Check initial state
      checkScroll()
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll)
      }
    }
  }, [])

  const handleAccept = async () => {
    if (!hasScrolledToBottom || !isChecked) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await acceptInstructorAgreement()
      if (result.success) {
        onAccept()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept agreement. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canAccept = hasScrolledToBottom && isChecked && !isSubmitting

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <h2 className="text-2xl font-bold">Instructor Agreement</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 bg-gray-50"
        >
          <div ref={contentRef} className="max-w-3xl mx-auto prose prose-lg">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-3xl font-bold mb-6 text-gray-900">ScholaPulse Instructor Agreement</h3>
              
              <p className="text-sm text-gray-600 mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

              <div className="space-y-6 text-gray-700">
                <section>
                  <h4 className="text-xl font-semibold mb-3 text-gray-900">1. Content Responsibility</h4>
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
                  <h4 className="text-xl font-semibold mb-3 text-gray-900">2. Prohibited Content</h4>
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
                  <h4 className="text-xl font-semibold mb-3 text-gray-900">3. Content Moderation</h4>
                  <p className="mb-4">
                    ScholaPulse reserves the right to review, moderate, and remove any content that violates these terms or 
                    our community guidelines. We may remove content without prior notice if we determine it violates this agreement.
                  </p>
                  <p className="mb-4">
                    You agree to cooperate with our moderation process and to promptly address any concerns raised about your content.
                  </p>
                </section>

                <section>
                  <h4 className="text-xl font-semibold mb-3 text-gray-900">4. Intellectual Property</h4>
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
                  <h4 className="text-xl font-semibold mb-3 text-gray-900">5. Student Interactions</h4>
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
                  <h4 className="text-xl font-semibold mb-3 text-gray-900">6. Platform Rules and Guidelines</h4>
                  <p className="mb-4">
                    You agree to comply with all ScholaPulse platform rules, terms of service, and community guidelines. 
                    These may be updated from time to time, and continued use of the platform constitutes acceptance of updates.
                  </p>
                </section>

                <section>
                  <h4 className="text-xl font-semibold mb-3 text-gray-900">7. Liability and Indemnification</h4>
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
                  <h4 className="text-xl font-semibold mb-3 text-gray-900">8. Termination</h4>
                  <p className="mb-4">
                    Either party may terminate this agreement at any time. ScholaPulse may terminate your access immediately 
                    if you violate this agreement. Upon termination, your content may be removed, but enrolled students will 
                    retain access to courses they have already purchased.
                  </p>
                </section>

                <section>
                  <h4 className="text-xl font-semibold mb-3 text-gray-900">9. Dispute Resolution</h4>
                  <p className="mb-4">
                    Any disputes arising from this agreement will be resolved through binding arbitration in accordance with 
                    applicable laws. You waive your right to participate in class-action lawsuits.
                  </p>
                </section>

                <section>
                  <h4 className="text-xl font-semibold mb-3 text-gray-900">10. Acceptance</h4>
                  <p className="mb-4">
                    By clicking "Accept" below, you acknowledge that you have read, understood, and agree to be bound by this 
                    Instructor Agreement. You also confirm that you have the legal authority to enter into this agreement.
                  </p>
                  <p className="mb-4 font-semibold text-gray-900">
                    This agreement is a legally binding contract. Please read it carefully before accepting.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Checkbox and Buttons */}
        <div className="p-6 border-t bg-white">
          {!hasScrolledToBottom && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-800">
              <Scroll className="h-4 w-4" />
              <span>Please scroll to the bottom of the agreement to continue</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex items-start space-x-3 mb-4">
            <Checkbox
              id="agree"
              checked={isChecked}
              onCheckedChange={(checked) => setIsChecked(checked as boolean)}
              disabled={!hasScrolledToBottom || isSubmitting}
              className="mt-1"
            />
            <Label
              htmlFor="agree"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I have read and understood the Instructor Agreement. I agree to be bound by all terms and conditions 
              stated above, including the content guidelines and prohibited content policies.
            </Label>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAccept}
              disabled={!canAccept}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Accepting...
                </span>
              ) : (
                'Accept Agreement'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


