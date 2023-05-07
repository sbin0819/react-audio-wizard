import { useEffect, useState, useCallback } from 'react'

import getBlobDuration from 'get-blob-duration'

type AudioStatus = 'idle' | 'playing' | 'paused'

type useAudioType = {
  url: string
}

export default function useAudioWizard({ url }: useAudioType) {
  const [audio] = useState(new Audio(url))
  let intervalId: NodeJS.Timeout
  const [audioReady, setAudioReady] = useState(false)
  const [status, setStatus] = useState<AudioStatus>('idle')

  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const fetchDuration = async () => {
      const durationFetched = await getBlobDuration(url)
      if (durationFetched - 1 > 0) {
        setDuration(durationFetched - 1) // offset difference with audio file
      } else {
        setDuration(durationFetched)
      }
    }
    fetchDuration()
  }, [url])

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
      audio.addEventListener('loadeddata', loadedDataHandler)
    }
    return () => {
      audio?.removeEventListener('loadeddata', loadedDataHandler)
    }
  }, [audio, audioReady])

  useEffect(() => {
    const intervalHandler = () => {
      setCurrentTime(audio.currentTime || 0)
    }
    if (status === 'playing') {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      intervalId = setInterval(intervalHandler, 300)
    } else {
      clearInterval(intervalId)
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [status, audio])

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

  return {
    status,
    play,
    pause,
    duration,
    currentTime,
  }
}
