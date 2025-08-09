Diagnosis: The build failed during the stage of installing dependencies because of an upstream dependency conflict related to the vite package and a peer dependency @vitest/mocker.

Solution:

Upstream Dependency Conflict:
The error message suggests fixing the upstream dependency conflict. To resolve this, you can try forcing the installation of dependencies by running the installation command with --force or --legacy-peer-deps.
Update the npm install command in your build script to include the --force flag to force the installation and bypass the dependency conflict.
Modify the installation command in your build script to look like: npm install --force.
Verify Package Versions:
Before forcing the installation, ensure that the conflicting package versions are specified correctly in your package.json file or any lock file to avoid unexpected behavior.
Verify that the required versions of vite and @vitest/mocker are accurately defined in your project's dependencies.
Further Analysis:
If the issue persists, you can delve into the detailed report and debug logs mentioned in the error message.
Check the logs located at /opt/buildhome/.npm/_logs/2025-08-09T07_10_27_007Z-eresolve-report.txt and /opt/buildhome/.npm/_logs/2025-08-09T07_10_27_007Z-debug-0.log for more insights into the dependency resolution problems.
Node.js Version Mismatch:
If you encounter Node.js versions mismatches in your project, consider referring to the documentation for changing Node versions to align with the expected version for your project.
By following these steps, you should be able to resolve the upstream dependency conflict causing the build failure.

3:10:16 PM: build-image version: 71a98eb82b055b934e7d58946f59957e90f5a76f (noble)
3:10:16 PM: buildbot version: 72ba091da8478e084b7407a21cd8435e7ecab808
3:10:16 PM: Fetching cached dependencies
3:10:16 PM: Starting to download cache of 279.2MB (Last modified: 2025-08-08 00:50:31 +0000 UTC)
3:10:16 PM: Finished downloading cache in 642ms
3:10:16 PM: Starting to extract cache
3:10:20 PM: Finished extracting cache in 3.221s
3:10:20 PM: Finished fetching cache in 3.945s
3:10:20 PM: Starting to prepare the repo for build
3:10:20 PM: Preparing Git Reference refs/heads/netlify
3:10:21 PM: Custom publish path detected. Proceeding with the specified path: 'frontend/dist'
3:10:21 PM: Starting to install dependencies
3:10:21 PM: Started restoring cached python cache
3:10:21 PM: Finished restoring cached python cache
3:10:22 PM: Started restoring cached ruby cache
3:10:22 PM: Finished restoring cached ruby cache
3:10:23 PM: Started restoring cached Node.js version
3:10:23 PM: Finished restoring cached Node.js version
3:10:23 PM: v18.20.8 is already installed.
3:10:23 PM: Now using node v18.20.8 (npm v10.8.2)
3:10:23 PM: Enabling Node.js Corepack
3:10:24 PM: Started restoring cached build plugins
3:10:24 PM: Finished restoring cached build plugins
3:10:24 PM: Started restoring cached corepack dependencies
3:10:24 PM: Finished restoring cached corepack dependencies
3:10:24 PM: No npm workspaces detected
3:10:24 PM: Started restoring cached node modules
3:10:24 PM: Finished restoring cached node modules
3:10:24 PM: Found npm version (10.8.2) that doesn't match expected (9)
Installing npm version 9
3:10:26 PM: removed 13 packages, and changed 86 packages in 2s
3:10:26 PM: 27 packages are looking for funding
3:10:26 PM:   run `npm fund` for details
3:10:26 PM: npm installed successfully
3:10:26 PM: Installing npm packages using npm version 9.9.4
3:10:28 PM: Failed during stage 'Install dependencies': dependency_installation script returned non-zero exit code: 1
3:10:28 PM: npm WARN ERESOLVE overriding peer dependency
3:10:28 PM: npm WARN While resolving: @vitest/mocker@2.1.9
3:10:28 PM: npm WARN Found: vite@7.1.1
3:10:28 PM: npm WARN node_modules/vite
3:10:28 PM: npm WARN   dev vite@"^7.0.4" from the root project
3:10:28 PM: npm WARN   1 more (@vitejs/plugin-react)
3:10:28 PM: npm WARN
3:10:28 PM: npm WARN Could not resolve dependency:
3:10:28 PM: npm WARN peerOptional vite@"^5.0.0" from @vitest/mocker@2.1.9
3:10:28 PM: npm WARN node_modules/@vitest/mocker
3:10:28 PM: npm WARN   @vitest/mocker@"2.1.9" from vitest@2.1.9
3:10:28 PM: npm WARN   node_modules/vitest
3:10:28 PM: npm WARN
3:10:28 PM: npm WARN Conflicting peer dependency: vite@5.4.19
3:10:28 PM: npm WARN node_modules/vite
3:10:28 PM: npm WARN   peerOptional vite@"^5.0.0" from @vitest/mocker@2.1.9
3:10:28 PM: npm WARN   node_modules/@vitest/mocker
3:10:28 PM: npm WARN     @vitest/mocker@"2.1.9" from vitest@2.1.9
3:10:28 PM: npm WARN     node_modules/vitest
3:10:28 PM: npm ERR! code ERESOLVE
3:10:28 PM: npm ERR! ERESOLVE could not resolve
3:10:28 PM: npm ERR!
3:10:28 PM: npm ERR! While resolving: react-query@3.39.3
3:10:28 PM: npm ERR! Found: react@19.1.1
3:10:28 PM: npm ERR! node_modules/react
3:10:28 PM: npm ERR!   react@"^19.1.0" from the root project
3:10:28 PM: npm ERR!   peer react@"^18 || ^19" from @tanstack/react-query@5.84.2
3:10:28 PM: npm ERR!   node_modules/@tanstack/react-query
3:10:28 PM: npm ERR!     @tanstack/react-query@"^5.84.1" from the root project
3:10:28 PM: npm ERR!   10 more (@testing-library/react, @xyflow/react, zustand, ...)
3:10:28 PM: npm ERR!
3:10:28 PM: npm ERR! Could not resolve dependency:
3:10:28 PM: npm ERR! peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-query@3.39.3
3:10:28 PM: npm ERR! node_modules/react-query
3:10:28 PM: npm ERR!   react-query@"^3.39.3" from the root project
3:10:28 PM: npm ERR!
3:10:28 PM: npm ERR! Conflicting peer dependency: react@18.3.1
3:10:28 PM: npm ERR! node_modules/react
3:10:28 PM: npm ERR!   peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-query@3.39.3
3:10:28 PM: npm ERR!   node_modules/react-query
3:10:28 PM: npm ERR!     react-query@"^3.39.3" from the root project
3:10:28 PM: npm ERR!
3:10:28 PM: npm ERR! Fix the upstream dependency conflict, or retry
3:10:28 PM: npm ERR! this command with --force or --legacy-peer-deps
3:10:28 PM: npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
3:10:28 PM: npm ERR!
3:10:28 PM: npm ERR!
3:10:28 PM: npm ERR! For a full report see:
3:10:28 PM: npm ERR! /opt/buildhome/.npm/_logs/2025-08-09T07_10_27_007Z-eresolve-report.txt
3:10:28 PM: npm ERR! A complete log of this run can be found in: /opt/buildhome/.npm/_logs/2025-08-09T07_10_27_007Z-debug-0.log
3:10:28 PM: Error during npm install
3:10:28 PM: Failing build: Failed to install dependencies