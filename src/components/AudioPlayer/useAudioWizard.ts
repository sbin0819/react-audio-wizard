import { useEffect, useState, useCallback, useRef } from 'react'

import getBlobDuration from 'get-blob-duration'

type AudioStatus = 'idle' | 'loaded' | 'playing' | 'paused'

type useAudioType = {
  url: string
}

export default function useAudioWizard({ url }: useAudioType) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)
  const [audioReady, setAudioReady] = useState(false)
  const [status, setStatus] = useState<AudioStatus>('idle')

  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    if (!audio) {
      setAudio(new Audio(url))
    }
  }, [audio, url])

  useEffect(() => {
    const fetchDuration = async () => {
      const durationFetched = await getBlobDuration(url)
      if (durationFetched - 1 > 0) {
        setDuration(durationFetched - 1) // offset difference with audio file
      } else {
        setDuration(durationFetched)
      }
    }
    if (audio) {
      fetchDuration()
    }
  }, [audio, url])

  useEffect(() => {
    const loadedDataHandler = () => {
      setAudioReady(true)
      if (audio?.duration === Infinity) {
        audio.currentTime = 1e101
        audio.ontimeupdate = () => {
          if (audio) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            audio.ontimeupdate = () => {}
            audio.currentTime = 0
          }
        }
      }
    }

    if (audio) {
      audio.load()
      setStatus('loaded')
      audio.addEventListener('loadeddata', loadedDataHandler)
    }
    return () => {
      audio?.removeEventListener('loadeddata', loadedDataHandler)
    }
  }, [audio, audioReady])

  useEffect(() => {
    if (audio) {
      const intervalHandler = () => {
        setCurrentTime(audio.currentTime || 0)
      }
      if (status === 'playing') {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        intervalIdRef.current = setInterval(intervalHandler, 300)
      } else {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current)
        }
      }
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [status, audio, currentTime, duration])

  useEffect(() => {
    if (currentTime >= duration) {
      setStatus('loaded')
      setCurrentTime(duration)
    }
    if (intervalIdRef.current && (audio?.ended || audio?.paused)) {
      clearInterval(intervalIdRef.current)
    }
  }, [audio?.ended, audio?.paused, currentTime, duration])

  const play = useCallback(() => {
    if (audio) {
      audio.play()
      setStatus('playing')
    }
  }, [audio])

  const pause = useCallback(() => {
    if (audio) {
      audio.pause()
      setStatus('paused')
    }
  }, [audio])

  const handleAudioSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const seekTime = +e.target.value
      if (typeof audio?.currentTime === 'number') {
        audio.currentTime = seekTime
        setCurrentTime(seekTime)
        audio.pause()
      }
    },
    [audio],
  )

  const handleSeek = useCallback(
    ({ seekTime }: { seekTime: number }) => {
      if (typeof audio?.currentTime === 'number' && seekTime < duration) {
        audio.currentTime = seekTime
        setCurrentTime(seekTime)
        audio.pause()
      } else {
        console.log('seekTime is greater than duration')
      }
    },
    [audio, duration],
  )

  return {
    status,
    play,
    pause,
    handleSeek,
    handleAudioSeek,
    duration,
    currentTime,
  }
}
