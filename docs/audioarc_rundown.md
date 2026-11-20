# AudioArc — Full Feature Rundown & Copy-Paste Listings

## Overview
- **Perchance App URL:** [https://perchance.org/audioarc](https://perchance.org/audioarc)
- **Pollinations App URL:** [https://audioarc.pollinations.app](https://audioarc.pollinations.app)

---

## What AudioArc Does (Complete Feature Map)

### 1. Input
- **Lyrics/Script Editor:** LRC timestamp support (`[mm:ss.xx]`), mic Transcribe, Whisper transcription (on-device WASM, Groq cloud, or OpenAI Whisper).
- **Import Formats:** LRC/SRT paste-import (auto-detect, time-shift, format conversion, `.lrc` download).
- **Audio Alignment:** Align-to-Audio (snaps stanzas to detected musical beats).
- **Media Upload:** MP3/WAV upload with live animatic playback, optional Narrative Arc, visual style picker, project reset/save.

### 2. Directing the Look
- **Storyboard Generation:** Fits scene durations to exact audio runtime, auto-creates B-roll for short lyrics.
- **Audio Intelligence:** AI listens to the track and times/transcribes every scene to the sonic structure.
- **Cast & Locations:** Create characters / upload reference photos, link them to scenes for visual continuity (Nano Banana models respect reference images with Low / Balanced / High adherence), AI Editor for prompt refinement.
- **Influence Library:** Curated presets (50s drive-in & delinquents, steampunk, synthwave/vaporwave, anime, fine-art movements, surrealists...), searchable, with "Ask Master Cinematographer" AI helper and custom entries.

### 3. Per-Scene Storyboard
- **Scene Attributes:** Timecodes, durations, section groups (Intro / Verse / Chorus / Bridge / Drop / Outro), camera movement, cinematic transitions.
- **Voice & Dialogue:** Voiceover tools (narrator tags), Wav2Lip lip-sync prompt helper.
- **Scene Tools:** AI scene summaries, director notes, merge/split scene cuts, group selection.
- **Prompt Generation:**
  - Master image prompt (with Color Grade, Style Refiner, Contrast Booster, smart tag suggestions, auto-enhance).
  - 3 graded video prompts (Subtle / Dynamic / Stylistic).
  - Sora / master prompt retargetable across platforms (Sora, Runway Gen-3, Kling, LTX, Veo 2, Google Flow).
- **Visual Previews:** One-click preview keyframe generation, Generate All, slideshow navigator with keyboard playback, Live Animatic player.

### 4. Export Ecosystem (~19 Formats)
- Project ZIP archive
- Master Shotlist CSV
- Screenplay format
- Image / Video / Sora prompt text packs
- Synchronized lyrics (`.lrc`)
- Project state JSON
- Storyboard PDF
- Comprehensive Master Production Bible PDF (title cover + narrative synopsis + character dossiers + scene breakdowns)
- ComfyUI image/video workflows
- Perchance native code
- Google Flow bridge (macros + Apps Script)
- Animatic & slideshow video render
- The Wunderbar! companion guide

### 5. AI & Engine Support
- **Default Engine:** Free built-in Perchance AI (zero configuration or API keys required).
- **Custom Engines (BYOK):** OpenAI (GPT-4o), OpenRouter, Ollama, LM Studio, Pollinations.
- **Directory & Utilities:** Curated directory of free image/video tools and editors, direct links to Runway / Luma / Kling / Sora, PWA installable offline app.

---

## Copy-Paste Listings

### General / Social Listing
**Title Options:**
- *AudioArc — turn your song into a complete AI music video storyboard (free, no sign-up)*
- *I made a free AI filmmaking studio: lyrics + MP3 in, full cinematic storyboard out*
- *Free tool for musicians: generate a shot-by-shot music video plan from your lyrics*

**Body:**
```text
AudioArc — free AI filmmaking studio for music videos 🎬
https://perchance.org/audioarc

Drop in your lyrics (or a timestamped LRC file) + your MP3, pick a visual style, and get back a complete shot-by-shot storyboard timed to your exact track — every scene with a master image prompt, 3 motion prompts, and a Sora-ready video prompt.

What it does:
🎙️ Lyrics your way — type, paste LRC/SRT, dictate, or auto-transcribe (on-device Whisper, Groq, or OpenAI)
🎵 AI that listens — Audio Intelligence mode analyzes your actual track for beats, sections, and timing
🎨 Direct the look — character/cast references for continuity, huge influence library (noir, anime, synthwave, baroque…), color grade + style refiner tools
🖼️ Generate preview keyframes in-app (incl. Nano Banana models), animatic player, slideshow + multi-track studio views
📦 Export everything — shotlist CSV, screenplay, prompt packs for Sora/Runway/Kling/Veo/Flow, ComfyUI workflows, storyboard + Production Bible PDFs, full project ZIP
🆓 Free, no sign-up — built-in AI included; bring your own keys only if you want to

Great for musicians planning a video, AI-video creators (Sora/Kling/Runway workflows), and storyboard nerds. Feedback welcome — what should it export next?
```

---

### For Suno Communities (r/SunoAI, Suno Facebook Groups)
**Title Options:**
- *Suno users: turn your AI song into a full music video storyboard (free tool)*
- *You made the song in Suno — here's how to get the music video for it*
- *From Suno track to shot-by-shot video plan in one evening*

**Body:**
```text
You finished the track — now give it the video. 🎬

I use AudioArc (free, browser-based, no sign-up): https://perchance.org/audioarc

The Suno → video workflow:
1. Export your MP3 from Suno + copy your lyrics
2. Upload both into AudioArc — its Audio Intelligence mode actually listens to your track and times every scene to the beat (no manual timestamping needed)
3. Pick a look (anime, noir, synthwave, cinematic realism, 50s drive-in horror…) and hit Generate Storyboard
4. You get a shot-by-shot plan: every scene with a keyframe image prompt + camera-motion prompts + a Sora-ready video prompt
5. Generate preview stills in-app, check the animatic, then export prompt packs made for Sora / Kling / Runway / Veo / Hailuo and render your clips

Also handles the boring-but-essential stuff: shotlist CSV, screenplay format, lyrics .lrc, and a multi-page Production Bible PDF if you're collaborating with an editor.

Free with built-in AI — you only need your own keys if you want to plug in GPT-4o/Ollama/etc. Would love feedback from Suno folks: what genre should I test the storyboarding on next?
```

---

### For Music Video / Filmmaker Groups (r/musicvideos, Video Production Communities)
**Title Options:**
- *Free pre-pro tool: lyrics + track in, timed storyboard + shotlist + production bible out*
- *I built a free AI storyboarding suite for music videos — roast my shotlists*
- *Directors: free tool that turns a song into a client-ready visual plan*

**Body:**
```text
AudioArc — free AI pre-production suite for music videos: https://perchance.org/audioarc

Built for the treatment-to-shoot pipeline: feed it the track + lyrics and it returns a timed, section-aware visual plan you can actually hand to a client or crew.

What's in it for directors/editors:
🎞️ Timed storyboards — scene durations fitted to the real audio runtime, grouped by section (Intro/Verse/Chorus/Drop), with beat-split and beat-snap rhythm tools
🎥 Per-scene direction — master keyframe prompt, 3 graded motion takes (subtle/dynamic/stylistic), camera + transition specs, voiceover and lip-sync sections
👥 Cast continuity — character sheets + photo references that carry through the image models
📄 Client-ready deliverables — Production Bible PDF (title page, synopsis, every scene with timecodes), screenplay format, shotlist CSV, full project ZIP
🔁 Revision workflow — AI scene editor, style refiner, contrast booster, per-scene regen, merge/split, one-click animatic
🧩 Pipeline-friendly exports — prompt packs per platform (Sora, Runway, Kling, LTX, Veo, Google Flow + macros/Apps Script), ComfyUI image + video workflows, slideshow/animatic renders

Free, runs in the browser, no account — built-in AI so it works out of the box. If you cut AI-assisted videos, I'd genuinely appreciate a stress-test: throw your weirdest track structure at the beat-timing and tell me where it breaks.
```
