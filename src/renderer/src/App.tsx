import { useEffect } from 'react'

import TitleBar from '@/components/TitleBar/TitleBar'
import NavBar from '@/components/NavBar/NavBar'
import StreamConfigList from '@/components/StreamConfigList/StreamConfigList'
import { useStreamConfigStore } from './store/useStreamConfigStore'

function App(): JSX.Element {
  const { initData } = useStreamConfigStore((state) => ({ initData: state.initialData }))
  useEffect(() => {
    initData()
  }, [])

  return (
    <>
      <TitleBar />
      <NavBar />

      <StreamConfigList />
    </>
  )
}

export default App
