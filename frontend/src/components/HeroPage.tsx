import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Heart, 
  Brain, 
  Activity, 
  Eye, 
  Stethoscope, 
  Zap, 
  Microscope, 
  Shield, 
  Clock, 
  CalendarCheck,
  HeartPulse,
  ChevronRight
} from 'lucide-react'

const HeroPage = () => {
  const navigate = useNavigate()
  const [animationsStarted, setAnimationsStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimationsStarted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleEnterCanvas = () => {
    navigate('/canvas')
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-gray-900 antialiased min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/95 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">AI-Powered Clinical Canvas</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Services</a>
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
              <button 
                onClick={handleEnterCanvas}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Enter Canvas
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header Section */}
        <div className={`flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between mb-16 transition-all duration-1000 ${animationsStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              AI-Powered Healthcare Analytics
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[0.9] font-semibold tracking-tight">
              Interactive Clinical<br />
              <span className="font-normal text-blue-700">Intelligence Canvas</span>
            </h1>
            <p className="text-lg text-gray-600 mt-6 leading-relaxed">
              Transform complex patient documents into visual dashboards that reduce clinical admin burden and support faster decision-making through AI-powered semantic search and analysis.
            </p>
          </div>

        </div>

        {/* Bento Grid Layout */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 h-[1000px] lg:h-[800px]">
          {/* Main Canvas Demo Card */}
          <div className={`col-span-2 md:col-span-2 lg:col-span-2 row-span-1 transition-all duration-1000 delay-400 ${animationsStarted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-full cursor-pointer" onClick={handleEnterCanvas}>
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1080&q=80" alt="Clinical dashboard" className="w-full h-full transition-transform duration-700 group-hover:scale-105 object-cover" />
              
              <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:max-w-xs">
                <div className="backdrop-blur-xl bg-white/95 border border-white/20 p-4 lg:p-5 rounded-2xl shadow-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold leading-tight">
                        Interactive Patient Canvas
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        Drag-and-drop clinical modules with AI-powered document analysis and visual workflows.
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600 text-sm">OCR</div>
                          <div className="text-xs text-gray-500">Document Processing</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600 text-sm">AI</div>
                          <div className="text-xs text-gray-500">Semantic Search</div>
                        </div>
                      </div>
                      <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <span>Enter Canvas</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Features Card */}
          <div className={`col-span-2 md:col-span-2 lg:col-span-2 row-span-1 transition-all duration-1000 delay-600 ${animationsStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="h-full rounded-3xl bg-gradient-to-br from-blue-800 to-blue-900 text-white p-6 lg:p-8 relative overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/10"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/5"></div>
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                      <Brain className="w-5 h-5 text-blue-200" />
                    </div>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur">
                      AI-Powered Features
                    </div>
                  </div>
                  
                  <h3 className="text-xl lg:text-2xl font-semibold leading-tight mb-4">
                    Advanced Clinical Intelligence
                  </h3>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-blue-300 shrink-0" />
                      <span>SOAP Note Generation</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-blue-300 shrink-0" />
                      <span>Document OCR & Analysis</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-blue-300 shrink-0" />
                      <span>Patient Timeline Visualization</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Brain className="w-4 h-4 text-blue-300 shrink-0" />
                      <span>Semantic Search & Q&A</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="text-xs text-blue-200">
                    Powered by LLM
                  </div>
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-2 rounded-full text-sm font-medium transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Quick Access Features */}
          <div className={`col-span-1 md:col-span-1 lg:col-span-2 row-span-1 transition-all duration-1000 delay-1000 ${animationsStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="h-full rounded-3xl bg-gradient-to-br from-red-100 to-red-50 p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <div>
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold leading-tight mb-3">
                  Instant Clinical Insights
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Get immediate answers from patient documents with AI-powered Q&A.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                  <Clock className="w-4 h-4" />
                  Response time: &lt;2 seconds
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <div className="w-16 h-16 opacity-60 group-hover:opacity-100 transition-opacity">
                  <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=80&q=80" alt="Clinical insights" className="w-full h-full object-cover rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Technology Showcase */}
          <div className={`col-span-1 md:col-span-1 lg:col-span-2 row-span-1 transition-all duration-1000 delay-1200 ${animationsStarted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="h-full rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <div>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Microscope className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold leading-tight mb-3">
                  Advanced ML Pipeline
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Powered by transformer models and vector embeddings for precise clinical understanding.
                </p>
              </div>
            </div>
          </div>

          {/* Canvas Preview */}
          <div className={`col-span-2 md:col-span-2 lg:col-span-2 row-span-1 transition-all duration-1000 delay-600 ${animationsStarted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="relative rounded-3xl overflow-hidden shadow-xl group h-full cursor-pointer" onClick={handleEnterCanvas}>
              <img src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1080&q=80" alt="Medical technology" className="w-full h-full transition-transform duration-700 group-hover:scale-105 object-cover" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-xl font-semibold mb-2">
                  Interactive Canvas Preview
                </h3>
                <p className="text-sm text-white/90 mb-4">
                  Drag-and-drop interface designed for clinical workflows
                </p>
                <button 
                  onClick={handleEnterCanvas}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  Try Demo
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className={`text-center mt-60 transition-all duration-1000 delay-1000 ${animationsStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CalendarCheck className="w-4 h-4" />
            Demo available now
          </div>
          <h2 className="text-3xl font-semibold mb-4 tracking-tight">Ready to Transform Clinical Workflows?</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Experience the future of clinical documentation with our AI-powered canvas interface.</p>
          <button 
            onClick={handleEnterCanvas}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <span>Enter the Clinical Canvas</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  )
}

export default HeroPage