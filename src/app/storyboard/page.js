'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StoryboardPage() {
  const router = useRouter()
  const [storyboard, setStoryboard] = useState(null)
  const [briefData, setBriefData] = useState(null)
  const [instagramHandle, setInstagramHandle] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load data from sessionStorage
    const storyboardData = sessionStorage.getItem('storyboard')
    const brief = sessionStorage.getItem('briefData')
    const handle = sessionStorage.getItem('instagramHandle')

    if (!storyboardData) {
      router.push('/')
      return
    }

    setStoryboard(JSON.parse(storyboardData))
    setBriefData(JSON.parse(brief))
    setInstagramHandle(handle || '')
  }, [router])

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyboard: storyboard.storyboard,
          brandInfo: briefData,
          creatorInfo: {
            name: instagramHandle || 'Creator',
            handle: instagramHandle || '@creator',
          },
          format: 'html',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Create a blob and download
        const blob = new Blob([data.data.html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${briefData.brandName}_Storyboard.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        alert('✅ Storyboard exported successfully!')
      }
    } catch (error) {
      alert('Error exporting: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!storyboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading storyboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {briefData?.brandName} x {instagramHandle || 'Creator'}
              </h1>
              <p className="text-gray-600">{briefData?.productName}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {briefData?.hashtags?.map((tag, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block mb-2">
                <div className="text-2xl font-bold">{storyboard.metadata.sceneCount}</div>
                <div className="text-xs">Scenes</div>
              </div>
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block ml-2">
                <div className="text-2xl font-bold">{storyboard.metadata.totalDuration}</div>
                <div className="text-xs">Duration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Storyboard Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {storyboard.storyboard.map((scene) => (
            <div key={scene.scene} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {/* Scene Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold">Scene {scene.scene}</h3>
                <span className="bg-blue-500 px-3 py-1 rounded-full text-sm font-medium">{scene.duration}</span>
              </div>

              {/* Visual Preview */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center relative">
                <div className="text-center p-4">
                  <div className="text-5xl mb-2">🎬</div>
                  <p className="text-gray-600 text-sm italic">{scene.visual}</p>
                </div>
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  9:16
                </div>
              </div>

              {/* Script */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Script</h4>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-800 italic">"{scene.script}"</p>
                </div>

                {/* Notes */}
                {scene.notes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Brand Requirement</h4>
                    <p className="text-green-600 text-sm flex items-start">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {scene.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Requirements Checklist */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">✅ Brand Requirements Checklist</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Talking Points</h3>
              <ul className="space-y-2">
                {briefData?.talkingPoints?.map((point, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Platform Specs</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Platform: {briefData?.platformSpecs?.platform}
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Format: {briefData?.platformSpecs?.format}
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Duration: {storyboard.metadata.totalDuration} (Target: {briefData?.duration})
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-lg transition"
          >
            ← Create New Storyboard
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? 'Exporting...' : '📤 Export for Brand Approval'}
          </button>
        </div>
      </div>
    </div>
  )
}
