import TitleBar from '@/components/TitleBar/TitleBar'
import NavBar from '@/components/NavBar/NavBar'
import StreamConfigList from '@/components/StreamConfigList/StreamConfigList'

function App(): JSX.Element {
  return (
    <>
      <TitleBar />
      <NavBar />

      <StreamConfigList />
    </>
  )
}

export default App
