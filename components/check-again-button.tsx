'use client'

export default function CheckAgainButton() {
  return (
    <button className="hm-btn" type="button" onClick={() => window.location.reload()}>
      Check again
    </button>
  )
}
