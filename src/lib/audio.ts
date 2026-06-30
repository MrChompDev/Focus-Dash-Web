import type { SoundType } from './types'

class AudioEngine {
  private ctx: AudioContext | null = null
  private nodes: AudioNode[] = []
  private _volume = 0.5
  private _isPlaying = false
  private _currentSound: SoundType | null = null

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  get volume() { return this._volume }
  get isPlaying() { return this._isPlaying }
  get currentSound() { return this._currentSound }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v))
    this.nodes.forEach(n => {
      if (n instanceof GainNode) n.gain.value = this._volume
    })
  }

  private createGain(): GainNode {
    const ctx = this.getCtx()
    const g = ctx.createGain()
    g.gain.value = this._volume
    g.connect(ctx.destination)
    this.nodes.push(g)
    return g
  }

  play(sound: SoundType) {
    this.stop()
    this._currentSound = sound
    this._isPlaying = true
    const ctx = this.getCtx()
    const gain = this.createGain()
    const methods: Record<SoundType, () => void> = {
      'White Noise': () => this.playWhiteNoise(ctx, gain),
      'Pink Noise': () => this.playPinkNoise(ctx, gain),
      'Brown Noise': () => this.playBrownNoise(ctx, gain),
      'Rain': () => this.playRain(ctx, gain),
      'Forest': () => this.playForest(ctx, gain),
      'Ocean': () => this.playOcean(ctx, gain),
    }
    methods[sound]()
  }

  private playWhiteNoise(ctx: AudioContext, gain: GainNode) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(gain); src.start()
    this.nodes.push(src)
  }

  private playPinkNoise(ctx: AudioContext, gain: GainNode) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = buf.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759
      b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856
      b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(gain); src.start()
    this.nodes.push(src)
  }

  private playBrownNoise(ctx: AudioContext, gain: GainNode) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < d.length; i++) { d[i] = (last + (Math.random() * 2 - 1) * 0.02) * 0.5; last = d[i] }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(gain); src.start()
    this.nodes.push(src)
  }

  private playRain(ctx: AudioContext, gain: GainNode) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) {
      const t = i / ctx.sampleRate
      d[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(t * 0.3)) * (0.5 + 0.5 * Math.sin(t * 4.7 + Math.sin(t * 2.3) * 2)) * 0.6
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2000
    src.connect(f); f.connect(gain); src.start()
    this.nodes.push(src, f)
  }

  private playForest(ctx: AudioContext, gain: GainNode) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) {
      const t = i / ctx.sampleRate
      d[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(t * 0.15) * Math.sin(t * 0.07)) * 0.3
        + Math.sin(t * 800 + Math.sin(t * 5) * 10) * 0.08 * Math.max(0, Math.sin(t * 1.7))
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 0.5
    src.connect(f); f.connect(gain); src.start()
    this.nodes.push(src, f)
  }

  private playOcean(ctx: AudioContext, gain: GainNode) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
    const d = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < d.length; i++) {
      const t = i / ctx.sampleRate
      last = (last + (Math.random() * 2 - 1) * 0.05) * 0.98
      d[i] = last * (0.6 + 0.4 * Math.sin(t * 0.08)) * 0.8
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400
    src.connect(f); f.connect(gain); src.start()
    this.nodes.push(src, f)
  }

  stop() {
    this.nodes.forEach(n => {
      try { if (n instanceof AudioScheduledSourceNode) n.stop() } catch {}
      try { n.disconnect() } catch {}
    })
    this.nodes = []; this._isPlaying = false; this._currentSound = null
  }

  cleanup() { this.stop(); if (this.ctx) this.ctx.close(); this.ctx = null }
}

export const audioEngine = new AudioEngine()
