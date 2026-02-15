'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [briefText, setBriefText] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [loading, setLoading] = useState(false)

  const sampleBrief = `Brand: Nike
Product: Air Max 2024

Campaign Requirements:
- Highlight the new cushioning technology
- Mention sustainability features (50% recycled materials)
- Show the shoes in action during a run

Must include hashtags: #Nike #AirMax2024 #JustDoIt
Duration: 15-30 seconds
Platform: Instagram Reels

Please avoid mentioning competitors or comparing to other shoe brands.`

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Parse brief
      const parseResponse = await fetch('/api/parse-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefText }),
      })

      const parseData = await parseResponse.json()

      if (!parseData.success) {
        alert('Error parsing brief: ' + parseData.error)
        setLoading(false)
        return
      }

      // Generate storyboard
      const storyboardResponse = await fetch('/api/generate-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredBrief: parseData.data,
          creatorStyle: {
            contentFormat: 'talking head vlog',
            tone: 'energetic and enthusiastic',
            aestheticTags: ['urban', 'athletic', 'minimal'],
          },
        }),
      })

      const storyboardData = await storyboardResponse.json()

      if (!storyboardData.success) {
        alert('Error generating storyboard: ' + storyboardData.error)
        setLoading(false)
        return
      }

      // Store in sessionStorage and navigate
      sessionStorage.setItem('storyboard', JSON.stringify(storyboardData.data))
      sessionStorage.setItem('briefData', JSON.stringify(parseData.data))
      sessionStorage.setItem('instagramHandle', instagramHandle)

      router.push('/storyboard')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Turn Brand Briefs into <span className="text-blue-600">Visual Storyboards</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get brand approval before you ever pick up a camera
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instagram Handle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Handle (Optional)
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@yourhandle"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">We'll analyze your style to make the storyboard feel authentic</p>
            </div>

            {/* Brand Brief */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Brand Sponsorship Brief
                </label>
                <button
                  type="button"
                  onClick={() => setBriefText(sampleBrief)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Use Sample Brief
                </button>
              </div>
              <textarea
                value={briefText}
                onChange={(e) => setBriefText(e.target.value)}
                placeholder="Paste your brand brief here... (email, PDF text, or message)"
                rows={12}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Include: Brand name, product, talking points, hashtags, duration, platform
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !briefText}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all ${
                loading || !briefText
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Storyboard...
                </span>
              ) : (
                '🎬 Generate Storyboard'
              )}
            </button>
          </form>
        </div>

        {/* How It Works */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-bold text-lg mb-2">1. Parse Brief</h3>
            <p className="text-gray-600 text-sm">We extract key requirements from your messy brand brief</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-bold text-lg mb-2">2. Generate Scenes</h3>
            <p className="text-gray-600 text-sm">AI creates 4-6 scenes matching your style and brand requirements</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-bold text-lg mb-2">3. Get Approval</h3>
            <p className="text-gray-600 text-sm">Share with brand for approval before filming</p>
          </div>
        </div>
      </div>
    </div>
  )
}
