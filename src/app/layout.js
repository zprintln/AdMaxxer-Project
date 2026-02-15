import './globals.css'

export const metadata = {
  title: 'AdMaxxer - AI Storyboard Creator',
  description: 'Turn brand briefs into visual storyboards for sponsored content',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">🎬 AdMaxxer</h1>
                <p className="ml-4 text-blue-100 text-sm">AI-Powered Storyboard Creator</p>
              </div>
              <div className="flex space-x-4">
                <a href="/" className="hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium transition">
                  Home
                </a>
                <a href="/storyboard" className="hover:bg-blue-500 px-3 py-2 rounded-md text-sm font-medium transition">
                  Storyboard
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-800 text-white mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center">
            <p className="text-sm">Built with Minimax AI, bem.ai, and Vercel</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
