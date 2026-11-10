import { describe, it, expect } from 'vitest';
import { AudioSynthesizer } from '@/game/audio/AudioSynthesizer';

describe('AudioSynthesizer', () => {
  it('instantiates and handles mute toggles safely in headless node environments', () => {
    const synth = new AudioSynthesizer();
    expect(synth).toBeDefined();

    // In Node/happy-dom where AudioContext may be mocked or absent, methods should never throw
    expect(() => {
      synth.setMuted(true);
      synth.playUiClick();
      synth.playJump();
      synth.playHit();
      synth.playCaptureSuccess();
    }).not.toThrow();
  });
});
