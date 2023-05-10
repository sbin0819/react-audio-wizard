# Headless audio player for React

A simple, customizable and headless audio player for React applications. This library is a hook that you can use to play audio files, pause, seek, and track current time and duration of the audio.

## Installation

```bash
npm install react-audio-wizard // or yarn
```
## Demo

[CodeSandbox](https://codesandbox.io/s/react-audio-wizard-3lqbe7?file=/tsconfig.json)

## Usage

```tsx
import { useAudioWizard } from 'react-audio-wizard'

function MyComponent() {
  const { status, play, pause, handleSeek, duration, currentTime } = useAudioWizard({ url: 'audiofile.mp3' })

  return (
    <div>
      <button onClick={play} disabled={status !== 'loaded' && status !== 'paused'}>
        Play
      </button>
      <button onClick={pause} disabled={status !== 'playing'}>
        Pause
      </button>
      <button onClick={() => handleSeek({ seekTime: 1 })}>+1</button>
      <p>Status: {status}</p>
      <p>Duration: {duration}</p>
      <p>Current Time: {currentTime}</p>
    </div>
  )
}
```

## API

`useAudioWizard({ url })`

The `useAudioWizard` function takes a single argument: an object that contains the url of the audio file.

Returns an object with the following properties:

- status: The current status of the audio. Can be 'idle', 'loaded', 'playing', or 'paused'.
- play: A function that starts playing the audio.
- pause: A function that pauses the audio.
- handleSeek: A function that seeks the audio to a specific time. It takes an object with a seekTime property.
- duration: The total duration of the audio in seconds.
- currentTime: The current playback position in seconds.
- handleAudioSeek(e: React.ChangeEvent<HTMLInputElement>)

The status returned from the useAudioWizard hook indicates the current state of the audio player. Here are the possible values:

- 'idle': The audio player is initialized but has not started loading any audio data yet. This is the default state when the hook is first used.
- 'loaded': The audio data has been fully loaded and the player is ready to start playback. You will typically switch to this state after the audio data has been fetched and is ready for use.
- 'playing': The audio is currently playing. You will typically switch to this state after the play function is invoked.
- 'paused': The audio is currently paused. You will typically switch to this state after the pause function is invoked.

License
MIT
