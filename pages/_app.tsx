import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage = router.pathname === "/login" || router.pathname === "/register" || router.pathname === "/forgot-password";

  return (
    isAuthPage ? (
      <Component {...pageProps} />
    ) : (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    )
  );
}
