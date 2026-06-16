
"use client"
import "./globals.scss";
import { Provider } from "react-redux";
import store from "@/shared/redux/store";
import PrelineScript from "./PrelineScript";
import { useState } from "react";
import { Initialload } from "@/shared/contextapi";
import ThemeHtmlSync from "@/shared/layout-components/theme/ThemeHtmlSync";
import { FORCE_LIGHT_MODE_INLINE_SCRIPT } from "@/shared/utils/forceLightMode";


const RootLayout = ({ children }: any) => {
  const [pageloading, setpageloading] = useState(false)
  return (
    <html lang="en" className="light" style={{ colorScheme: "light only" }} suppressHydrationWarning>
      <head>
        <title>Samsara Wellness</title>
        <meta name="color-scheme" content="light only" />
        <script dangerouslySetInnerHTML={{ __html: FORCE_LIGHT_MODE_INLINE_SCRIPT }} />
      </head>
      <body>
        <Provider store={store}>
          <Initialload.Provider value={{ pageloading, setpageloading }}>
            <ThemeHtmlSync />
            {children}
          </Initialload.Provider>
        </Provider>
        <PrelineScript />
      </body>
    </html>
  )
}
export default RootLayout
