import type * as React from 'react';

// True when running on an iOS device (including iPadOS reporting as "Mac").
export const isIOS =
  ['iPad', 'iPhone', 'iPod'].includes(
    // navigator.platform is discouraged for platform detection (unreliable in
    // general, and frozen to a fixed value per OS by User-Agent reduction), but
    // it's still the clearest iOS signal available; prefer userAgentData where present.
    (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform ||
    navigator.platform
  ) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

// Work around https://github.com/mui/material-ui/issues/31869: on iOS Safari,
// lifting a finger off a Slider without moving it first synthesizes a
// mouse{move,down,up} sequence *after* the touch gesture ends. MUI's v7 Slider
// (mouse-event based) turns that synthetic `mousedown` into an extra `onChange`
// carrying the value from where the drag started, which snaps a controlled
// slider back to its original position. Ignore that event.
export function isSpuriousIOSSliderChange(event: Event | React.SyntheticEvent): boolean {
  return isIOS && event.type === 'mousedown';
}
