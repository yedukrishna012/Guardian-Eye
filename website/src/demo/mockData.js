const REASONS = {
  fall: 'Fall detected for ≥ 10 seconds',
  fallVoice: 'Fall ≥ 5 seconds + voice emergency keyword',
  voice: 'Voice emergency keyword repeated ≥ 3 times within 20 seconds',
  chest: 'Hand on chest detected for ≥ 10 seconds',
  chestVoice: 'Hand on chest + voice emergency keyword',
  test: 'Test emergency alert',
}

function makeEmergency(id, reason, status, timestamp) {
  return { id, reason, status, timestamp }
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000)
}

function daysAgo(days, hour = 14) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 24, 0, 0)
  return date
}

export function createDemoEmergencies() {
  return [
    makeEmergency('demo-f4a91c2e', REASONS.fallVoice, 'resolved', hoursAgo(3)),
    makeEmergency('demo-b7e20d51', REASONS.voice, 'resolved', hoursAgo(9)),
    makeEmergency('demo-c1d84a73', REASONS.chestVoice, 'resolved', hoursAgo(28)),
    makeEmergency('demo-e9a30f18', REASONS.fall, 'resolved', hoursAgo(41)),
    makeEmergency('demo-6b2c8d94', REASONS.test, 'resolved', hoursAgo(52)),
    makeEmergency('demo-a4f17e62', REASONS.chest, 'resolved', daysAgo(3, 18)),
    makeEmergency('demo-d8c51b07', REASONS.voice, 'resolved', daysAgo(4, 9)),
    makeEmergency('demo-3f7a92c5', REASONS.fall, 'resolved', daysAgo(5, 21)),
    makeEmergency('demo-9e14b6a8', REASONS.fallVoice, 'resolved', daysAgo(6, 15)),
    makeEmergency('demo-7c93d0f2', REASONS.chestVoice, 'resolved', daysAgo(8, 11)),
    makeEmergency('demo-1a68e4b9', REASONS.voice, 'resolved', daysAgo(9, 23)),
    makeEmergency('demo-5d02c7f6', REASONS.fall, 'resolved', daysAgo(11, 8)),
    makeEmergency('demo-8b41a3e0', REASONS.test, 'resolved', daysAgo(12, 16)),
    makeEmergency('demo-2e75c9d1', REASONS.chest, 'resolved', daysAgo(13, 12)),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function createSimulatedEmergency() {
  const timestamp = new Date()
  return {
    id: `demo-${Math.random().toString(16).slice(2, 10)}`,
    reason: REASONS.fall,
    status: 'active',
    timestamp,
  }
}

export { REASONS }
