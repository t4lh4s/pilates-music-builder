'use client'
import { useState } from 'react'

export default function HelpPage({ onOpenFeedback }: { onOpenFeedback: () => void }) {
  const [activeSection, setActiveSection] = useState('getting-started')

  const sections = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'song-browser', label: 'Song Browser' },
    { id: 'class-builder', label: 'Class Builder' },
    { id: 'custom-movements', label: 'Custom Movements' },
    { id: 'spotify', label: 'Importing Spotify Playlists' },
    { id: 'playlists', label: 'Managing Playlists' },
    { id: 'bpm-counter', label: 'BPM Tap Counter' },
    { id: 'save-export', label: 'Saving & Exporting' },
    { id: 'tips', label: 'Tips & Best Practices' },
    { id: 'faq', label: 'FAQ' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
      {/* Sidebar nav */}
      <aside className="w-full lg:w-56 lg:shrink-0">
        <div className="lg:sticky lg:top-20 space-y-1">
          <h2 className="font-display font-bold text-sage-900 text-lg mb-3">Help & Guide</h2>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                activeSection === s.id
                  ? 'bg-sage-500 text-white font-semibold'
                  : 'text-sage-600 hover:bg-cream-100'
              }`}>
              {s.label}
            </button>
          ))}
          <div className="pt-3 mt-3 border-t border-cream-200">
            <button onClick={onOpenFeedback}
              className="w-full text-left text-sm px-3 py-2 rounded-lg bg-cream-100 hover:bg-cream-200 text-sage-700 font-medium flex items-center gap-2 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Send feedback
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 max-w-3xl">
        <div className="bg-white border border-cream-200 rounded-2xl p-6 sm:p-8">
          {activeSection === 'getting-started' && <GettingStarted/>}
          {activeSection === 'song-browser' && <SongBrowserHelp/>}
          {activeSection === 'class-builder' && <ClassBuilderHelp/>}
          {activeSection === 'custom-movements' && <CustomMovementsHelp/>}
          {activeSection === 'spotify' && <SpotifyHelp/>}
          {activeSection === 'playlists' && <PlaylistsHelp/>}
          {activeSection === 'bpm-counter' && <BpmCounterHelp/>}
          {activeSection === 'save-export' && <SaveExportHelp/>}
          {activeSection === 'tips' && <TipsHelp/>}
          {activeSection === 'faq' && <FaqHelp onOpenFeedback={onOpenFeedback}/>}
        </div>
      </main>
    </div>
  )
}

// ─── Section components ──────────────────────────────────

function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="font-display font-bold text-2xl text-sage-900 mb-4">{children}</h1>
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display font-semibold text-lg text-sage-900 mt-6 mb-2">{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-sage-700 leading-relaxed mb-3">{children}</p>
}
function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm text-sage-700 leading-relaxed">
          <span className="shrink-0 w-5 h-5 rounded-full bg-sage-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i+1}</span>
          <span dangerouslySetInnerHTML={{ __html: item }}/>
        </li>
      ))}
    </ol>
  )
}
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-sage-50 border-l-4 border-sage-400 px-4 py-3 my-4 rounded-r-lg">
      <p className="text-sm text-sage-800"><span className="font-semibold">Tip:</span> {children}</p>
    </div>
  )
}

function GettingStarted() {
  return (
    <>
      <H1>Welcome to Pilates Music Builder</H1>
      <P>This tool helps you plan Pilates classes by matching songs to the energy and tempo of each section. No more spending hours building playlists for every class.</P>

      <H2>What you can do</H2>
      <P>Browse a curated library of songs sorted by BPM and genre, build classes block by block (warm-up, peak work, cool-down), import your existing Spotify playlists, and export class plans as PDFs.</P>

      <H2>Three main sections</H2>
      <Steps items={[
        '<strong>Song Browser</strong> — Discover songs that match the tempo of what you teach.',
        '<strong>Class Builder</strong> — Plan a full class with blocks, movements, and matching songs.',
        '<strong>BPM Counter</strong> — Tap along to a song to find its exact BPM.',
      ]}/>

      <Tip>
        Sign in to save your classes and Spotify playlists across devices. Without signing in, your work disappears when you close the tab.
      </Tip>
    </>
  )
}

function SongBrowserHelp() {
  return (
    <>
      <H1>Song Browser</H1>
      <P>The library has 700+ songs hand-picked for Pilates, sorted by BPM, genre, and energy. Use this to discover music that matches the pace you want.</P>

      <H2>Filtering</H2>
      <Steps items={[
        '<strong>Tempo</strong> — Quick filters: Slow (60-80), Medium (80-100), Fast (100-120), High Energy (120+).',
        '<strong>Genre</strong> — Pop, R&B, Hip-Hop, Electronic.',
        '<strong>BPM range</strong> — Drag the sliders for an exact range.',
        '<strong>Length</strong> — Filter by song duration if you want shorter or longer tracks.',
      ]}/>

      <H2>Adding songs to a playlist</H2>
      <P>Click the bookmark icon on any song card to add it to your active playlist. The active playlist is selected on the right side panel.</P>

      <H2>Listening preview</H2>
      <P>Each song card has a Spotify and Apple Music link. Click to open the song in your music app and preview it.</P>

      <Tip>
        Use the search bar in the header to find a specific song or artist. Fastest way to navigate the library.
      </Tip>
    </>
  )
}

function ClassBuilderHelp() {
  return (
    <>
      <H1>Class Builder</H1>
      <P>Plan an entire class section by section, with songs that match the energy of each block.</P>

      <H2>Setup</H2>
      <Steps items={[
        'Choose <strong>Mat</strong> or <strong>Reformer</strong>.',
        'Choose <strong>class duration</strong> (45, 50, 55, or 60 minutes).',
        'Choose <strong>level</strong> (Beginner, Intermediate, Advanced).',
        'Click <strong>Build Class Structure</strong>.',
      ]}/>

      <H2>Adding blocks</H2>
      <P>Your class starts empty. Tap the green <strong>+</strong> button in the summary panel to add your first block. Each block represents a section of your class.</P>

      <H2>Customizing a block</H2>
      <Steps items={[
        '<strong>Rename</strong> — Click the block name to type a new one.',
        '<strong>Change emoji</strong> — Click the emoji to pick a different one.',
        '<strong>Set duration</strong> — Use the dropdown to set how many minutes this block should take.',
        '<strong>Set BPM range</strong> — Adjust to match the tempo you want for this section.',
        '<strong>Reorder</strong> — Drag blocks up or down to change their order.',
        '<strong>Delete</strong> — Hover and click the X.',
      ]}/>

      <H2>Adding movements</H2>
      <P>Click a block to make it active, then select movements from the list. Each movement has a recommended BPM that auto-tunes the block&apos;s tempo. The more movements you select, the better the song matches.</P>

      <H2>Adding songs to a block</H2>
      <P>With a block active, search the library or browse your imported Spotify playlists in the right panel. Songs that match the block&apos;s BPM range are highlighted. Click to add.</P>

      <Tip>
        The energy arc at the top of the summary panel visualizes your class flow. You want it to peak in the middle and come down for cool-down.
      </Tip>
    </>
  )
}

function CustomMovementsHelp() {
  return (
    <>
      <H1>Custom Movements</H1>
      <P>If a movement you teach isn&apos;t in our library, you can add your own.</P>

      <H2>How to add</H2>
      <Steps items={[
        'Click any block to make it active.',
        'In the Movements section, click <strong>+ Add Custom</strong>.',
        'Enter the movement name, ideal BPM, and approximate duration in seconds.',
        'Click <strong>Add to block</strong>.',
      ]}/>

      <P>Your custom movement gets auto-selected for the active block and saved to your movement list. You can use it in other blocks too.</P>

      <H2>Removing custom movements</H2>
      <P>Hover over any custom movement chip to reveal a small X button. Click it to remove the movement entirely.</P>

      <Tip>
        Custom movements are session-only for now — they reset when you refresh the page. We&apos;re adding permanent storage soon.
      </Tip>
    </>
  )
}

function SpotifyHelp() {
  return (
    <>
      <H1>Importing Spotify Playlists</H1>
      <P>You can import any Spotify playlist as a CSV. This brings your existing playlists into the app so you can use them when building classes.</P>

      <H2>Step-by-step</H2>
      <Steps items={[
        'Open <a href="https://exportify.net" target="_blank" rel="noreferrer" class="text-sage-500 underline hover:text-sage-700">exportify.net</a> in a new tab and sign in with Spotify.',
        'Find the playlist you want to import and click <strong>Export</strong>. A CSV file downloads.',
        'Come back to Pilates Music Builder and click the <strong>Spotify</strong> tab in the right panel.',
        'Click <strong>Import CSV</strong> and select the file you downloaded.',
        'Give the playlist a name and click <strong>Save</strong>.',
      ]}/>

      <H2>Updating an existing playlist</H2>
      <P>If you import a playlist with the same name as one already saved, you&apos;ll be asked whether to update the existing one or save as a new one.</P>

      <H2>Where do imports show up?</H2>
      <P>Imported playlists appear two places: in the <strong>Playlist tab</strong> as selectable pills, and in the <strong>Class Builder</strong> under "My Playlists" when adding songs to a block.</P>

      <Tip>
        Exportify only works with playlists you can see in your Spotify account. Make sure the playlist is saved to your library first.
      </Tip>
    </>
  )
}

function PlaylistsHelp() {
  return (
    <>
      <H1>Managing Playlists</H1>
      <P>You can have as many playlists as you want — manual ones you build from scratch, or imported Spotify ones.</P>

      <H2>Creating a new playlist</H2>
      <Steps items={[
        'Go to the <strong>Playlist</strong> tab in the right panel.',
        'Click <strong>+ New</strong> at the top.',
        'Type a name and hit Enter.',
      ]}/>

      <H2>Switching between playlists</H2>
      <P>Click any playlist pill to make it active. Songs you add will go to whichever playlist is active.</P>

      <H2>Renaming or deleting</H2>
      <P>Double-click a playlist pill to rename it. The active manual playlist also shows a small pencil and X icon you can click. Spotify imports can&apos;t be renamed or deleted from this view — manage those in the Spotify tab.</P>

      <H2>Copying songs between playlists</H2>
      <P>From a Spotify imported playlist, hover any song and click the + button. Pick a destination playlist from the dropdown. The song gets copied.</P>

      <H2>Copying playlist as text</H2>
      <P>Click <strong>Copy</strong> at the top of any playlist to copy a formatted text version of the songs (with BPM and duration). Paste into anything — Notes, email, etc.</P>
    </>
  )
}

function BpmCounterHelp() {
  return (
    <>
      <H1>BPM Tap Counter</H1>
      <P>Find the BPM of any song by tapping along to the beat. Useful when you have a song in mind and want to know if it fits a block.</P>

      <H2>How to use</H2>
      <Steps items={[
        'Open the <strong>BPM Counter</strong> tab.',
        'Play your song on Spotify or any other app.',
        'Tap the big button (or press the <strong>spacebar</strong>) on each beat.',
        'After 4-8 taps, the BPM stabilizes. Read it from the display.',
      ]}/>

      <P>The counter automatically resets if you stop tapping for 3 seconds.</P>

      <Tip>
        The counter also shows which Pilates zone the BPM falls into (slow warm-up, medium flow, peak work, etc.) so you know where in a class the song fits best.
      </Tip>
    </>
  )
}

function SaveExportHelp() {
  return (
    <>
      <H1>Saving & Exporting</H1>

      <H2>Save a class plan</H2>
      <P>Once you&apos;ve built a class, click <strong>Save</strong> at the bottom of the summary panel. You need to be signed in. Your class is saved to your account and accessible from any device.</P>

      <H2>Load a saved class</H2>
      <P>From the setup screen, your saved classes appear at the bottom. Click any to load it. You can also delete them from there.</P>

      <H2>Export to PDF</H2>
      <P>Click <strong>Export PDF</strong> in the summary panel. A formatted PDF downloads with your class structure, song list, BPM, and equipment notes. Bring it to class on your phone or print it.</P>

      <H2>Copy as text</H2>
      <P>The <strong>Copy</strong> button copies a plain-text version of the entire class plan. Useful for sharing with subs or pasting into class notes.</P>
    </>
  )
}

function TipsHelp() {
  return (
    <>
      <H1>Tips & Best Practices</H1>

      <H2>Build classes around energy, not just BPM</H2>
      <P>BPM matters, but energy matters more. A 75 BPM song with steady drums feels different from a 75 BPM song with sparse instrumentals. Use BPM as a starting point, then trust your ears.</P>

      <H2>Plan for transitions</H2>
      <P>Big BPM jumps between blocks feel jarring. If your warm-up ends at 75 BPM and your peak block starts at 110, consider a 90 BPM "ramp" block in between.</P>

      <H2>Save your favorite playlists</H2>
      <P>If you find yourself building similar classes, save the playlist once and reuse it. You can have a "Reformer Intermediate" playlist, "Mat 60min" playlist, etc.</P>

      <H2>Use custom movements freely</H2>
      <P>If you teach a signature exercise, add it as a custom movement. It&apos;ll auto-tune the BPM range for that block based on your input.</P>

      <H2>Test the energy arc</H2>
      <P>The energy arc is a quick visual sanity check. If it&apos;s flat or peaks at the wrong place, your class probably needs rebalancing.</P>
    </>
  )
}

function FaqHelp({ onOpenFeedback }: { onOpenFeedback: () => void }) {
  const faqs = [
    {
      q: 'Why are some songs missing from search?',
      a: 'Our library is hand-curated and currently has 700+ songs. We are working on expanding to 50,000+ over the next month. If a specific song you want is missing, send us a feedback note and we will prioritize adding it.',
    },
    {
      q: 'Can I edit a Spotify imported playlist?',
      a: 'Imported playlists are read-only in the Playlist tab — they reflect what is in Spotify. To make changes, edit the playlist in Spotify, re-export with Exportify, and re-import (we will offer to update the existing one).',
    },
    {
      q: 'What happens to my custom movements?',
      a: 'Right now they are stored only in your browser session, so they reset on refresh. We are adding permanent storage soon.',
    },
    {
      q: 'Can multiple instructors share an account?',
      a: 'Each sign-in creates a personal workspace. For team accounts, send us feedback — it is on our roadmap.',
    },
    {
      q: 'Does this work offline?',
      a: 'No, you need an internet connection. Sorry.',
    },
    {
      q: 'How accurate is the BPM data?',
      a: 'BPM is sourced from GetSongBPM and verified against multiple databases. Most songs are accurate within ±2 BPM. If you spot a wrong one, send us feedback.',
    },
    {
      q: 'Can I use this on my phone?',
      a: 'Yes, the app is mobile-optimized. Class Builder works best on a tablet or laptop because of the multi-column layout, but everything is functional on phone.',
    },
  ]

  return (
    <>
      <H1>FAQ</H1>
      {faqs.map((f, i) => (
        <div key={i} className="mb-5">
          <h3 className="text-sm font-semibold text-sage-900 mb-1">{f.q}</h3>
          <p className="text-sm text-sage-600 leading-relaxed">{f.a}</p>
        </div>
      ))}
      <div className="mt-6 pt-6 border-t border-cream-200">
        <p className="text-sm text-sage-600 mb-3">Have a question we didn&apos;t cover?</p>
        <button onClick={onOpenFeedback}
          className="text-sm font-semibold text-white bg-sage-500 hover:bg-sage-600 px-4 py-2 rounded-lg transition-colors">
          Send us a question
        </button>
      </div>
    </>
  )
}
