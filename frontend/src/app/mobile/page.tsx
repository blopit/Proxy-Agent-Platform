'use client'

import React, { useState } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'
import BiologicalTabs from '@/components/mobile/BiologicalTabs'
import CapturePage from './capture/page'

type Mode = 'capture' | 'scout' | 'hunter' | 'mender' | 'mapper'

export default function MobileApp() {
  const [mode, setMode] = useState<Mode>('capture')
  const [energy] = useState(72)
  const [timeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning')

  return (
    <div style={{ minHeight: '100vh', background: '#002b36', color: '#93a1a1' }}>
      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: 12, background: '#073642', borderBottom: '1px solid #586e75' }}>
        <strong>Mobile</strong>
      </div>

      {/* Main content area - account for bottom tabs height */}
      <div style={{ height: 'calc(100vh - 48px - 92px)', paddingBottom: 12 }}>
        {mode === 'capture' ? (
          <ErrorBoundary>
            <CapturePage onTaskCaptured={() => { /* noop for now */ }} />
          </ErrorBoundary>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>{mode.toUpperCase()}</div>
              <div style={{ color: '#586e75' }}>Content coming next. Tabs are working.</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom tabs */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#073642', borderTop: '1px solid #586e75', padding: '8px 0', zIndex: 20 }}>
        <BiologicalTabs
          activeTab={mode}
          onTabChange={(t) => setMode(t as Mode)}
          energy={energy}
          timeOfDay={timeOfDay}
        />
      </div>
    </div>
  )
}
