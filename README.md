# Unfair Flappy Bird 🎮💀

**A chaotic, rage-inducing, and utterly unfair version of the classic Flappy Bird.**

⚠️ **WARNING: This game is designed to be brutally difficult and visually overwhelming. Play at your own risk!** ⚠️

[![Play Now](https://img.shields.io/badge/Play-Now-red?style=for-the-badge)](https://jxmked.github.io/Flappybird/)

---

## 🎯 What Makes It "Unfair"

From the **very first second**, Unfair Flappy Bird assaults you with:

- **30-40 simultaneous visual effects** making it nearly impossible to see
- **4-7 chaos events on EVERY pipe** (no mercy, starting from pipe 0)
- **95% chance of bird chaos** on every pipe pass
- **35% of your button presses completely ignored**
- **Random gravity shifts, wind gusts, and sudden death drops**
- **Invisible pipes, magnetic pulls, shrinking gaps, and fake pipes**

**Score 5 is a genuine achievement. Score 10 is legendary.**

---

## 🎨 Visual Chaos (17 Effects, 30-40 Active!)

Every single frame, the game applies multiple visual disturbances:

| Effect               | Description                           |
| -------------------- | ------------------------------------- |
| **Blackout**         | Screen covered in 85% black overlay   |
| **Bird Invisible**   | Your bird completely vanishes         |
| **Screen Glitch**    | Horizontal slices with RGB separation |
| **Screen Offset**    | Game view shifts 60-300px randomly    |
| **Flicker**          | Rapid white flashing                  |
| **Static Noise**     | 30% of screen is TV static            |
| **Screen Shake**     | Violent 60px shaking                  |
| **Blur**             | Entire screen blurred (4px)           |
| **Invert**           | Colors inverted (negative)            |
| **Zoom**             | Screen zooms to 1.3x                  |
| **Double Vision**    | Ghost images offset by 10px           |
| **Color Shift**      | Hue rotation overlay                  |
| **Rainbow**          | Psychedelic color cycling             |
| **Pixelate**         | 12px blocky pixels                    |
| **Scanlines**        | CRT monitor effect                    |
| **Extreme Contrast** | Blown out highlights/shadows          |
| **Vignette**         | Dark edges closing in                 |

**Frequency**: 5 batches added every frame × 5-7 effects per batch = **30-40 simultaneous effects**

---

## 🏗️ Pipe Chaos (12 Types × 4-7 Per Pipe!)

Every pipe spawns with **4-7 simultaneous chaos events**:

### Movement Chaos

- **Gap Teleport** - Gap jumps ±120px instantly
- **Gap Drift** - Continuously moves while approaching
- **Double Troll** - Gap moves, then moves again 150ms later
- **Pipe Swap** - Swaps position with next pipe

### Visual Deception

- **Invisible Pipe** - Completely invisible until 60px away
- **Bait Pipe** - Looks real but has no collision (distractor)
- **Phantom Pipe** - Invisible collision near real pipe
- **Late Spawn** - Appears 50-150ms late

### Physics Traps

- **Magnet Pipe** - Pulls bird toward gap (up to 3px/frame)
- **Shrinking Pipe** - Narrows by 2% per frame
- **Fake Ceiling** - Invisible collision inside the gap
- **Collision Shift** - Hitbox offset from visual

### Base Traps (Random Assignment)

- **Troll Move** - Shifts suddenly when near
- **Fake Gap** - Gap is solid, kills on contact
- **Snap Close** - Shrinks to 5px in 80ms
- **Reverse Zone** - Controls inverted inside gap
- **Normal** - Rare! (10% chance)

---

## 🐦 Bird Chaos (7 Types, 95% Activation!)

Every pipe pass has **95% chance** to activate:

| Chaos             | Effect                   | Frequency        |
| ----------------- | ------------------------ | ---------------- |
| **Input Lag**     | 35% of flaps ignored     | Every press      |
| **Flap Random**   | Power varies 0.7x-1.3x   | Every flap       |
| **Flap Delay**    | 50-120ms delay           | Random           |
| **Sudden Drop**   | Downward velocity spike  | 15% per frame    |
| **Air Burst**     | 1.5x gravity for 5s      | 10% start chance |
| **Gravity Shift** | 0.3x-2.3x gravity        | 8% per frame     |
| **Wind Gust**     | ±150px/s horizontal push | 10% start chance |

---

## ⚙️ Technical Specifications

### Chaos Frequency

```
Visual Chaos:     5 batches/frame × 5-7 effects = 30-40 effects
Pipe Chaos:       4-7 events per pipe (ALL pipes from 0)
Bird Chaos:       95% activation per pipe pass
Input Lag:        35% of presses ignored
Sudden Drop:      15% chance per frame
```

### Trigger Timing (Impossible!)

```
Late Trigger:     35 pixels before pipe
Reaction Window:  <60ms (humanly impossible)
Snap Close:       80ms duration
Min Gap:          5 pixels
```

### Visual Effect Duration

```
Min Duration:     1 second
Max Duration:     2.5 seconds
Overlap:          Constant (new added every frame)
```

---

## 🎮 How to Play

### Controls

- **Click / Tap / Space** - Flap (if it registers...)

### Pro Tips

1. **Use audio cues** - When you can't see, listen for sounds
2. **Expect failures** - 35% of inputs won't work
3. **Feel the magnet** - You'll sense the pull toward gaps
4. **Ignore bait pipes** - Some pipes are just distractions
5. **Memorize patterns** - Traps are chaotic but learnable
6. **Trust muscle memory** - Visuals will betray you constantly

### Scoring

- **Score 1-2**: Good start! Most don't get past 1.
- **Score 3-4**: Impressive! You're getting the hang of it.
- **Score 5+**: Legendary! You have mastered the chaos.
- **Score 10+**: GODLIKE! Screenshot this immediately.

---

## 🛠️ Built With

- **TypeScript** - Core language
- **HTML5 Canvas** - Rendering engine
- **Webpack** - Module bundler
- **SCSS** - Styling

---

## 🚀 Features

- ✅ 17 different visual chaos effects
- ✅ 12 pipe chaos event types
- ✅ 7 bird chaos mechanics
- ✅ 30-40 simultaneous visual effects
- ✅ 95% chaos activation rate
- ✅ Immediate chaos from game start
- ✅ No artificial difficulty walls
- ✅ Pure skill-based (with luck)
- ✅ Desktop & mobile support
- ✅ PWA (Progressive Web App) ready
- ✅ 60 FPS performance

---

## 🎮 Play Online

**[👉 Click Here to Play Unfair Flappy Bird!](https://jxmked.github.io/Flappybird/)**

---

## 🔧 Development

### Prerequisites

```bash
Node.js 16+
npm or yarn
```

### Installation

```bash
git clone https://github.com/jxmked/Flappybird.git
cd Flappybird
npm install
```

### Development Mode

```bash
npm start
# Open http://localhost:3000
```

### Production Build

```bash
npm run build
# Output in dist/ folder
```

---

## 📊 Performance

Despite the chaos, the game maintains **stable 60 FPS**:

- 30-40 canvas operations per frame
- Real-time physics calculations
- Chaos event processing
- Particle effects and animations

Tested on:

- Chrome 120+
- Firefox 120+
- Safari 17+
- Mobile browsers (iOS Safari, Chrome Android)

---

## 🐛 Known "Features"

These are **intentional**, not bugs:

- Screen may induce headaches (flicker effect)
- Bird may spontaneously disappear (invisible effect)
- Controls may stop responding (input lag)
- Gravity may change mid-flight (gravity shift)
- Pipes may be invisible (invisible pipe)
- Your score will likely stay at 0-3

If you experience these, **the game is working as intended!** 💀

---

## 📝 License

This is a parody/educational project. Original Flappy Bird concept by Dong Nguyen.

Copyright (c) 2026 VCMR - All modifications and chaos systems.

---

## 🙏 Credits

- Original concept: Dong Nguyen (.GEARS)
- Chaos design: Inspired by Kaizo games and unfair platformers
- Built with: Frustration, spite, and too much free time

---

## 🔗 Links

- **🎮 Play**: [https://jxmked.github.io/Flappybird/](https://jxmked.github.io/Flappybird/)
- **📁 Repository**: [https://github.com/jxmked/Flappybird](https://github.com/jxmked/Flappybird)
- **👤 Author**: [jxmked](https://github.com/jxmked)

---

## ⚠️ Medical Disclaimer

This game may cause:

- Mild frustration
- Moderate rage
- Severe determination
- Uncontrollable laughter at your own deaths

**Play responsibly. Take breaks. Don't break your device.**

---

## 💀 Final Words

> _"Why did I make this? Because I hate fun."_ - The Developer

**Good luck. You'll need it.**

---

<p align="center">
  <a href="https://jxmked.github.io/Flappybird/">
    <img src="https://img.shields.io/badge/PLAY-NOW-red?style=for-the-badge&logo=gamepad&logoColor=white" alt="Play Now"/>
  </a>
</p>

<p align="center">
  <strong>🎮 Unfair Flappy Bird - Where Fun Goes to Die 💀</strong>
</p>
