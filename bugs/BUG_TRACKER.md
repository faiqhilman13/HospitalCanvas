7:02:53 PM: build-image version: 71a98eb82b055b934e7d58946f59957e90f5a76f (noble)
7:02:53 PM: buildbot version: 72ba091da8478e084b7407a21cd8435e7ecab808
7:02:53 PM: Fetching cached dependencies
7:02:53 PM: Starting to download cache of 279.2MB (Last modified: 2025-08-08 00:50:31 +0000 UTC)
7:02:54 PM: Finished downloading cache in 544ms
7:02:54 PM: Starting to extract cache
7:02:56 PM: Finished extracting cache in 2.515s
7:02:56 PM: Finished fetching cache in 3.111s
7:02:56 PM: Starting to prepare the repo for build
7:02:56 PM: Preparing Git Reference refs/heads/netlify
7:02:57 PM: Custom publish path detected. Proceeding with the specified path: 'frontend/dist'
7:02:58 PM: Starting to install dependencies
7:02:58 PM: Started restoring cached python cache
7:02:58 PM: Finished restoring cached python cache
7:02:58 PM: Started restoring cached ruby cache
7:02:58 PM: Finished restoring cached ruby cache
7:02:59 PM: Started restoring cached Node.js version
7:02:59 PM: Finished restoring cached Node.js version
7:02:59 PM: v18.20.8 is already installed.
7:03:00 PM: Now using node v18.20.8 (npm v10.8.2)
7:03:00 PM: Enabling Node.js Corepack
7:03:00 PM: Started restoring cached build plugins
7:03:00 PM: Finished restoring cached build plugins
7:03:00 PM: Started restoring cached corepack dependencies
7:03:00 PM: Finished restoring cached corepack dependencies
7:03:00 PM: No npm workspaces detected
7:03:00 PM: Started restoring cached node modules
7:03:00 PM: Finished restoring cached node modules
7:03:00 PM: Found npm version (10.8.2) that doesn't match expected (9)
Installing npm version 9
7:03:02 PM: removed 13 packages, and changed 86 packages in 2s
7:03:02 PM: 27 packages are looking for funding
7:03:02 PM:   run `npm fund` for details
7:03:02 PM: npm installed successfully
7:03:02 PM: Installing npm packages using npm version 9.9.4
7:03:04 PM: Failed during stage 'Install dependencies': dependency_installation script returned non-zero exit code: 1
7:03:04 PM: npm WARN ERESOLVE overriding peer dependency
7:03:04 PM: npm WARN While resolving: @vitest/mocker@2.1.9
7:03:04 PM: npm WARN Found: vite@7.1.1
7:03:04 PM: npm WARN node_modules/vite
7:03:04 PM: npm WARN   dev vite@"^7.0.4" from the root project
7:03:04 PM: npm WARN   1 more (@vitejs/plugin-react)
7:03:04 PM: npm WARN
7:03:04 PM: npm WARN Could not resolve dependency:
7:03:04 PM: npm WARN peerOptional vite@"^5.0.0" from @vitest/mocker@2.1.9
7:03:04 PM: npm WARN node_modules/@vitest/mocker
7:03:04 PM: npm WARN   @vitest/mocker@"2.1.9" from vitest@2.1.9
7:03:04 PM: npm WARN   node_modules/vitest
7:03:04 PM: npm WARN
7:03:04 PM: npm WARN Conflicting peer dependency: vite@5.4.19
7:03:04 PM: npm WARN node_modules/vite
7:03:04 PM: npm WARN   peerOptional vite@"^5.0.0" from @vitest/mocker@2.1.9
7:03:04 PM: npm WARN   node_modules/@vitest/mocker
7:03:04 PM: npm WARN     @vitest/mocker@"2.1.9" from vitest@2.1.9
7:03:04 PM: npm WARN     node_modules/vitest
7:03:04 PM: npm ERR! code ERESOLVE
7:03:04 PM: npm ERR! ERESOLVE could not resolve
7:03:04 PM: npm ERR!
7:03:04 PM: npm ERR! While resolving: react-query@3.39.3
7:03:04 PM: npm ERR! Found: react@19.1.1
7:03:04 PM: npm ERR! node_modules/react
7:03:04 PM: npm ERR!   react@"^19.1.0" from the root project
7:03:04 PM: npm ERR!   peer react@"^18 || ^19" from @tanstack/react-query@5.84.2
7:03:04 PM: npm ERR!   node_modules/@tanstack/react-query
7:03:04 PM: npm ERR!     @tanstack/react-query@"^5.84.1" from the root project
7:03:04 PM: npm ERR!   10 more (@testing-library/react, @xyflow/react, zustand, ...)
7:03:04 PM: npm ERR!
7:03:04 PM: npm ERR! Could not resolve dependency:
7:03:04 PM: npm ERR! peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-query@3.39.3
7:03:04 PM: npm ERR! node_modules/react-query
7:03:04 PM: npm ERR!   react-query@"^3.39.3" from the root project
7:03:04 PM: npm ERR!
7:03:04 PM: npm ERR! Conflicting peer dependency: react@18.3.1
7:03:04 PM: npm ERR! node_modules/react
7:03:04 PM: npm ERR!   peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-query@3.39.3
7:03:04 PM: npm ERR!   node_modules/react-query
7:03:04 PM: npm ERR!     react-query@"^3.39.3" from the root project
7:03:04 PM: npm ERR!
7:03:04 PM: npm ERR! Fix the upstream dependency conflict, or retry
7:03:04 PM: npm ERR! this command with --force or --legacy-peer-deps
7:03:04 PM: npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
7:03:04 PM: npm ERR!
7:03:04 PM: npm ERR!
7:03:04 PM: npm ERR! For a full report see:
7:03:04 PM: npm ERR! /opt/buildhome/.npm/_logs/2025-08-09T11_03_03_026Z-eresolve-report.txt
7:03:04 PM: npm ERR! A complete log of this run can be found in: /opt/buildhome/.npm/_logs/2025-08-09T11_03_03_026Z-debug-0.log
7:03:04 PM: Error during npm install
7:03:04 PM: Failing build: Failed to install dependencies