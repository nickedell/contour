import '../styles/globals.css'
import SiteLayout from '@/components/layout/SiteLayout'

export default function App({ Component, pageProps }) {
  // Allow any page to define its own getLayout function
  const getLayout =
    Component.getLayout || ((page) => <SiteLayout>{page}</SiteLayout>)

  return getLayout(<Component {...pageProps} />)
}