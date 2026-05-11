# SketchFlow AI - Project TODO

## Phase 1: Architecture & Design System
- [x] Define data models (User, Project, Scene, Subscription, Credits)
- [x] Design dark-themed color palette and typography system
- [x] Create reusable component library (buttons, cards, inputs, modals)
- [x] Set up Tailwind CSS with custom theme tokens
- [x] Design micro-interaction patterns (transitions, hover states, loading states)

## Phase 2: Landing Page
- [x] Build hero section with CTA
- [x] Build feature highlights section (6-8 key features)
- [x] Build example gallery with video previews
- [x] Build pricing section with 4 tiers: Free, Starter, Creator, Growth
- [x] Add responsive navigation header
- [x] Add footer with links and branding

## Phase 3: Authentication & User Dashboard
- [x] Implement Manus OAuth integration
- [x] Build user dashboard layout
- [x] Build video project list view
- [x] Build creation history view
- [x] Build credit usage tracker
- [x] Add user profile/settings page

## Phase 4: Script Input Interface
- [x] Build script input form (textarea for script)
- [x] Build document upload component (PDF, DOCX, TXT)
- [x] Build whiteboard style selector (sketch, canvas, chalkboard)
- [x] Add validation and error handling
- [x] Build preview of selected style

## Phase 5: AI Script Generation
- [x] Integrate LLM to parse script and generate structured scenes
- [x] Implement scene structure: title, narration text, illustration keywords
- [ ] Build scene generation UI with loading state
- [x] Add error handling and retry logic
- [x] Store generated scenes in database

## Phase 6: SVG Whiteboard Animation Engine
- [x] Build SVG asset library with categorized illustrations (basic geometric shapes)
- [x] Implement image generation integration for scene-specific SVGs
- [x] Build hand-draw stroke reveal animation using CSS/Framer Motion
- [x] Implement scene rendering pipeline
- [x] Add animation timing controls

## Phase 7: Timeline Editor
- [x] Build timeline UI with scene thumbnails
- [ ] Implement scene reordering (drag-and-drop)
- [x] Add scene preview canvas
- [x] Display narration text per scene
- [x] Add editable scene duration controls
- [x] Build scene editing modal

## Phase 8: Voice Narration System
- [x] Build voice style selector (male, female)
- [x] Integrate text-to-speech API
- [x] Implement narration sync with animation
- [x] Build audio preview player
- [x] Add narration timing adjustments

## Phase 9: Video Export (MP4)
- [x] Integrate Remotion for video rendering
- [x] Implement MP4 export pipeline
- [x] Build watermark toggle (gated by plan tier)
- [x] Add export progress tracking
- [x] Implement video storage and download
- [x] Add export quality/resolution options

## Phase 10: Polish & Refinement
- [ ] Implement dark theme consistently across all pages
- [ ] Add smooth micro-interactions and transitions
- [ ] Optimize responsive design for mobile, tablet, desktop
- [ ] Add loading skeletons and empty states
- [ ] Implement error boundaries and error messages
- [ ] Add accessibility features (ARIA labels, keyboard navigation)

## Phase 11: Testing & Deployment
- [ ] Write unit tests for critical functions
- [ ] Test user flows end-to-end
- [ ] Performance optimization
- [ ] Security audit (auth, storage, API)
- [ ] Deploy and monitor

## Subscription & Credit System
- [ ] Free tier: 1 video/month, watermark, basic styles
- [ ] Starter tier: 5 videos/month, no watermark, all styles
- [ ] Creator tier: 20 videos/month, no watermark, priority support
- [ ] Growth tier: unlimited videos, no watermark, custom features
- [ ] Implement credit-based usage tracking
- [ ] Build subscription management UI

## Constraints & Requirements
- Plan names: Free, Starter, Creator, Growth (exact)
- Whiteboard styles: sketch, canvas, chalkboard (exact)
- Voice options: male, female
- Watermark toggle tied to plan tier
- Scene structure: title + narration text + illustration keywords
- Dark-themed elegant UI with smooth micro-interactions
- Responsive design across all devices
- Cloud storage for all assets

## Completed
