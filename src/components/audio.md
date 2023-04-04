```tsx
import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.ceil(seconds % 60)
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`
  return `${formattedMinutes}:${formattedSeconds}`
}

interface Props {
  src: string
  style?: React.CSSProperties
  rangeWidth?: number
}

const AudioControls = ({ src, style, rangeWidth }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()
  const progressRef = useRef<HTMLInputElement>(null)
  const volumeRef = useRef<HTMLInputElement>(null)
  const volumeContainerRef = useRef<HTMLDivElement>(null)
  const [isPlay, setIsPlay] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isOpenSpeaker, setIsOpenSpeaker] = useState(false)
  const [volume, setVolume] = useState(1)
  const gradiansValue = useMemo(() => 100 / duration, [duration])

  useEffect(() => {
    const loadedDataHandler = () => {
      setAudioReady(true)
      if (audioRef.current?.duration === Infinity) {
        audioRef.current.currentTime = 1e101
        audioRef.current.ontimeupdate = () => {
          if (audioRef.current) {
            audioRef.current.ontimeupdate
            setDuration(audioRef.current?.duration || 0)
            audioRef.current.currentTime = 0
          }
        }
      }
    }

    if (audioRef.current) {
      audioRef.current.load()
      audioRef.current.addEventListener('loadeddata', loadedDataHandler)
    }
    return () => {
      audioRef.current?.removeEventListener('loadeddata', loadedDataHandler)
    }
  }, [audioRef])

  useEffect(() => {
    if (audioRef.current && src && duration) {
      audioRef.current.currentTime = 0
      setIsPlay(false)
      setCurrentTime(0)
    }
  }, [audioRef, duration, src])

  useEffect(() => {
    if (audioRef.current) {
      isFinite(audioRef.current.duration) && setDuration(audioRef.current.duration)
    }
  }, [audioRef, audioReady, src])

  useEffect(() => {
    if (audioRef.current) {
      setVolume(audioRef.current.volume * 12)
    }
  }, [isOpenSpeaker, audioRef])

  useEffect(() => {
    const intervalHandler = () => {
      setCurrentTime(audioRef.current?.currentTime || 0)
    }
    if (isPlay) {
      intervalRef.current = setInterval(intervalHandler, 300)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => {
      clearInterval(intervalRef.current)
    }
  }, [audioRef, isPlay])

  useEffect(() => {
    if (currentTime === duration) {
      setIsPlay(false)
    }
    if (audioRef.current?.ended || audioRef.current?.paused) {
      clearInterval(intervalRef.current)
    }
  }, [audioRef, currentTime, duration])

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.background = `linear-gradient(to right, #d43f8d 0%, #0250c5 ${
        gradiansValue * currentTime
      }%, rgb(236, 236, 236) ${gradiansValue * currentTime}%, rgb(236, 236, 236) 100%)`
    }
  }, [currentTime, gradiansValue, progressRef])

  useEffect(() => {
    if (volumeRef.current) {
      volumeRef.current.style.background = `linear-gradient(to right, #d43f8d 0%, #0250c5 ${
        gradiansValue * volume
      }%, rgb(236, 236, 236) ${gradiansValue * volume}%, rgb(236, 236, 236) 100%)`
      if (audioRef && audioRef.current && audioRef.current.volume) {
        if (volume === 0) {
          audioRef.current.muted = true
        }
        if (volume > 0 && volume < 11) {
          audioRef.current.volume = volume / 10
          audioRef.current.muted = false
        } else if (volume === 11) {
          audioRef.current.volume = (volume - 1) / 10
          audioRef.current.muted = false
        } else if (volume === 12) {
          audioRef.current.volume = (volume - 2) / 10
          audioRef.current.muted = false
        }
      }
    }
  }, [audioRef, volumeRef, volume, gradiansValue, isOpenSpeaker])

  // const onHandlePlay = useCallback(() => {
  //   audioRef.current?.play()
  //   setIsPlay(true)
  // }, [audioRef])

  // const onHandlePause = useCallback(() => {
  //   audioRef.current?.pause()
  //   setIsPlay(false)
  // }, [audioRef])

  // const handleAudioSeek = useCallback(
  //   (e: ChangeEvent<HTMLInputElement>) => {
  //     const seekTime = +e.target.value
  //     if (typeof audioRef.current?.currentTime === 'number') {
  //       audioRef.current.currentTime = seekTime
  //       setCurrentTime(seekTime)
  //       onHandlePause()
  //     }
  //   },
  //   [audioRef, onHandlePause],
  // )

  // const handleVolumeChange = useCallback(
  //   (e: ChangeEvent<HTMLInputElement>) => {
  //     const currentVolume = +e.target.value
  //     if (audioRef.current && audioRef.current.volume) {
  //       if (currentVolume < 9) {
  //         setVolume(currentVolume)
  //       } else if (currentVolume === 9) {
  //         setVolume(currentVolume + 1)
  //       } else {
  //         setVolume(currentVolume + 2)
  //       }
  //     }
  //   },
  //   [audioRef],
  // )

  // const handleSpeakerClick = useCallback(() => {
  //   setIsOpenSpeaker((prev) => !prev)
  // }, [])

  return (
    <div>
      <audio preload='metadata' ref={audioRef} src={src} className='display-none' />
    </div>
  )
}

export default AudioControls
```
