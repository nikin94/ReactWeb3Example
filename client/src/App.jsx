import { Navbar, Welcome, Services, Transactions, Footer } from './components'

const App = () => {
  return (
    <div className="min-h-screen">
      <h1 className="gradient-bg-welcome">
        <Navbar />
        <Welcome />
      </h1>
      <Services />
      <Transactions />
      <Footer />
    </div>
  )
}

export default App
