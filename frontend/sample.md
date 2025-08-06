<html lang="en"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MedCore Health - Advanced Medical Solutions</title>
  
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <style>
    body { font-family: 'Inter', sans-serif; }
    .animate-delay-200 { animation-delay: 0.2s; }
    .animate-delay-400 { animation-delay: 0.4s; }
    .animate-delay-600 { animation-delay: 0.6s; }
    .animate-delay-800 { animation-delay: 0.8s; }
    .animate-delay-1000 { animation-delay: 1.0s; }
    .animate-delay-1200 { animation-delay: 1.2s; }
    
    .glass-effect {
      backdrop-filter: blur(20px);
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideLeft {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    
    .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
    .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }
    .animate-slide-left { animation: slideLeft 0.8s ease-out forwards; }
    .animate-scale-in { animation: scaleIn 0.6s ease-out forwards; }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=IBM+Plex+Serif:wght@300;400;500;600;700&amp;family=IBM+Plex+Mono:wght@300;400;500;600;700&amp;family=Inter&amp;display=swap" rel="stylesheet">
</head>

<body class="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-gray-900 antialiased">
  <!-- Navigation -->
  <nav class="fixed top-0 w-full z-50 glass-effect border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="heart-pulse" class="lucide lucide-heart-pulse w-4 h-4 text-white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path></svg>
          </div>
          <span class="font-semibold text-lg tracking-tight">MedCore Health</span>
        </div>
        <div class="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Services</a>
          <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Specialists</a>
          <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Research</a>
          <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">About</a>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  </nav>

  <main class="max-w-7xl sm:px-6 lg:px-8 lg:py-24 mr-auto ml-auto pt-20 pr-4 pb-20 pl-4">
    <!-- Header Section -->
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between mb-16 opacity-0 animate-fade-in" style="animation-play-state: running;">
      <div class="max-w-2xl">
        <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="shield-check" class="lucide lucide-shield-check w-4 h-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
          Healthcare Excellence Certified
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[0.9] font-semibold tracking-tight">
          Advanced Medical<br>
          <span class="font-normal text-blue-700">Care Solutions</span>
        </h1>
        <p class="text-lg text-gray-600 mt-6 leading-relaxed">
          Delivering cutting-edge healthcare with compassionate care, innovative technology, and evidence-based treatments for optimal patient outcomes.
        </p>
      </div>

      <!-- Stats & Accreditation -->
      <div class="flex flex-col gap-6 lg:items-end opacity-0 animate-slide-left animate-delay-200" style="animation-play-state: running;">
        <div class="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div class="flex space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star w-5 h-5 fill-blue-400 text-blue-400"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star w-5 h-5 fill-blue-400 text-blue-400"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star w-5 h-5 fill-blue-400 text-blue-400"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star w-5 h-5 fill-blue-400 text-blue-400"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star w-5 h-5 fill-blue-400 text-blue-400"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
          </div>
          <div class="text-left">
            <div class="font-semibold text-gray-900">4.9 Patient Rating</div>
            <div class="text-sm text-gray-500">15,000+ reviews</div>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-gray-600">Trusted by patients</span>
          <div class="flex -space-x-3">
            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&amp;h=120&amp;fit=crop&amp;crop=face" alt="Patient" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm">
            <img src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=120&amp;h=120&amp;fit=crop&amp;crop=face" alt="Patient" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm">
            <img src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1080&amp;q=80" alt="Patient" class="w-10 h-10 object-cover border-white border-2 rounded-full shadow-sm">
            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&amp;h=120&amp;fit=crop&amp;crop=face" alt="Patient" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm">
            <div class="w-10 h-10 bg-blue-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
              <span class="text-xs font-semibold text-blue-700">15K+</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bento Grid Layout -->
    <section class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 h-[800px] lg:h-[600px]">
      <!-- Main Hero Card -->
      <div class="col-span-2 md:col-span-2 lg:col-span-3 row-span-1 opacity-0 animate-scale-in animate-delay-400" style="animation-play-state: running;">
        <div class="relative rounded-3xl overflow-hidden shadow-2xl group h-full" style="transform: translateY(0px);">
          <img src="https://images.unsplash.com/photo-1516670428252-df97bba108d1?w=1080&amp;q=80" alt="Medical professionals" class="w-full h-full transition-transform duration-700 group-hover:scale-105 object-cover">
          
          <div class="absolute bottom-6 left-6 right-6 lg:right-auto lg:max-w-xs">
            <div class="glass-effect p-4 lg:p-5 rounded-2xl shadow-xl">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="stethoscope" class="lucide lucide-stethoscope w-5 h-5 text-blue-600"><path d="M11 2v2"></path><path d="M5 2v2"></path><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"></path><path d="M8 15a6 6 0 0 0 12 0v-3"></path><circle cx="20" cy="10" r="2"></circle></svg>
                </div>
                <div class="">
                  <h3 class="text-lg font-semibold leading-tight">
                    Expert Medical Care
                  </h3>
                  <p class="text-sm text-gray-600 mt-2 leading-relaxed">
                    Board-certified physicians with 20+ years of experience in advanced medical treatments.
                  </p>
                  <div class="flex items-center gap-4 mt-3">
                    <div class="text-center">
                      <div class="font-semibold text-blue-600 text-sm">98%</div>
                      <div class="text-xs text-gray-500">Success Rate</div>
                    </div>
                    <div class="text-center">
                      <div class="font-semibold text-blue-600 text-sm">24/7</div>
                      <div class="text-xs text-gray-500">Emergency</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Specialties Card -->
      <div class="col-span-2 md:col-span-2 lg:col-span-2 row-span-1 opacity-0 animate-slide-up animate-delay-600" style="animation-play-state: running;">
        <div class="h-full rounded-3xl bg-gradient-to-br from-blue-800 to-blue-900 text-white p-6 lg:p-8 relative overflow-hidden shadow-2xl group" style="transform: translateY(0px);">
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/10"></div>
            <div class="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/5"></div>
          </div>
          
          <div class="relative z-10 h-full flex flex-col justify-between">
            <div class="">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="brain" class="lucide lucide-brain w-5 h-5 text-blue-200"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
                </div>
                <div class="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur">
                  Medical Specialties
                </div>
              </div>
              
              <h3 class="text-xl lg:text-2xl font-semibold leading-tight mb-4">
                Comprehensive Healthcare Solutions
              </h3>
              
              <ul class="space-y-2 text-sm">
                <li class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="heart" class="lucide lucide-heart w-4 h-4 text-blue-300 shrink-0"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                  <span class="">Cardiology &amp; Heart Care</span>
                </li>
                <li class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="brain" class="lucide lucide-brain w-4 h-4 text-blue-300 shrink-0"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>
                  <span class="">Neurology &amp; Brain Health</span>
                </li>
                <li class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="activity" class="lucide lucide-activity w-4 h-4 text-blue-300 shrink-0"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>
                  <span class="">Orthopedic Surgery</span>
                </li>
                <li class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="eye" class="lucide lucide-eye w-4 h-4 text-blue-300 shrink-0"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <span>Ophthalmology Services</span>
                </li>
              </ul>
            </div>
            
            <div class="flex items-center justify-between mt-6">
              <div class="text-xs text-blue-200">
                Insurance Accepted
              </div>
              <button class="bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-2 rounded-full text-sm font-medium transition-colors">
                View All
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Patient Reviews -->
      <div class="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 opacity-0 animate-slide-left animate-delay-800" style="animation-play-state: running;">
        <div class="h-full rounded-3xl bg-white p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 group" style="transform: translateY(0px);">
          <div class="">
            <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="user-check" class="lucide lucide-user-check w-5 h-5 text-green-600"><path d="m16 11 2 2 4-4"></path><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            </div>
            <div class="flex space-x-1 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star w-4 h-4 fill-green-400 text-green-400"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star w-4 h-4 fill-green-400 text-green-400"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star w-4 h-4 fill-green-400 text-green-400"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star w-4 h-4 fill-green-400 text-green-400"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star w-4 h-4 fill-green-400 text-green-400"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed mb-4">
              "Outstanding care and professionalism. The team saved my life."
            </p>
          </div>
          <div class="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1080&amp;q=80" alt="Michael R." class="w-8 h-8 object-cover rounded-full">
            <div class="">
              <div class="font-medium text-sm">Michael R.</div>
              <div class="text-xs text-gray-500">Heart Surgery Patient</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Emergency Services -->
      <div class="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 opacity-0 animate-slide-up animate-delay-1000" style="animation-play-state: running;">
        <div class="h-full rounded-3xl bg-gradient-to-br from-red-100 to-red-50 p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300 group" style="transform: translateY(0px);">
          <div class="">
            <div class="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="zap" class="lucide lucide-zap w-5 h-5 text-white"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
            </div>
            <h3 class="text-lg lg:text-xl font-semibold leading-tight mb-3">
              24/7 Emergency Care
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed mb-4">
              Round-the-clock emergency services with rapid response times.
            </p>
            <div class="flex items-center gap-2 text-sm font-medium text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="clock" class="lucide lucide-clock w-4 h-4"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Average response: 8 minutes
            </div>
          </div>
          <div class="flex justify-end mt-4">
            <div class="w-16 h-16 opacity-60 group-hover:opacity-100 transition-opacity">
              <img src="https://images.unsplash.com/photo-1643780668909-580822430155?w=1080&amp;q=80" alt="Emergency" class="w-full h-full object-cover rounded-xl">
            </div>
          </div>
        </div>
      </div>

      <!-- Technology Card -->
      <div class="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 opacity-0 animate-scale-in animate-delay-1200" style="animation-play-state: running;">
        <div class="h-full rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300 group" style="transform: translateY(0px);">
          <div class="">
            <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="microscope" class="lucide lucide-microscope w-5 h-5 text-indigo-600"><path d="M6 18h8"></path><path d="M3 22h18"></path><path d="M14 22a7 7 0 1 0 0-14h-1"></path><path d="M9 14h2"></path><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"></path><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"></path></svg>
            </div>
            <h3 class="text-lg lg:text-xl font-semibold leading-tight mb-3">
              Advanced Medical Technology
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed mb-4">
              State-of-the-art equipment and innovative treatment methods.
            </p>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Diagnostic accuracy</span>
                <span class="font-semibold text-indigo-600">99.2%</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Treatment success</span>
                <span class="font-semibold text-indigo-600">96.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Facility Image -->
      <div class="col-span-2 md:col-span-2 lg:col-span-2 row-span-1 opacity-0 animate-slide-left animate-delay-600" style="animation-play-state: running;">
        <div class="relative rounded-3xl overflow-hidden shadow-xl group h-full" style="transform: translateY(0px);">
          <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1080&amp;q=80" alt="Medical facility" class="w-full h-full transition-transform duration-700 group-hover:scale-105 object-cover">
          
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent bg-[url(https://images.unsplash.com/photo-1613497767060-7e837a28b413?w=1080&amp;q=80)] bg-cover"></div>
          
          <div class="absolute bottom-6 left-6 right-6 text-white">
            <h3 class="text-xl font-semibold mb-2">
              Modern Medical Facility
            </h3>
            <p class="text-sm text-white/90 mb-4">
              World-class infrastructure designed for patient comfort and care
            </p>
            <button class="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Virtual Tour
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <div class="opacity-0 animate-fade-in animate-delay-1000 text-center mt-48" style="animation-play-state: running;">
      <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="calendar-check" class="lucide lucide-calendar-check w-4 h-4"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path><path d="m9 16 2 2 4-4"></path></svg>
        Same-day appointments available
      </div>
      <h2 class="text-3xl font-semibold mb-4 tracking-tight">Ready to Experience Better Healthcare?</h2>
      <p class="text-gray-600 mb-8 max-w-md mx-auto">Join thousands of patients who trust us with their health and wellness journey.</p>
      <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
        Schedule Your Appointment
      </button>
    </div>
  </main>

  <script>
    lucide.createIcons();
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('[class*="animate-"]').forEach(el => {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
    
    document.querySelectorAll('.group').forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.style.transform = 'translateY(-2px)';
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translateY(0)';
      });
    });
  </script>

</body></html>