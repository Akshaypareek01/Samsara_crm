"use client"
import Switcher from "@/shared/layout-components/switcher/switcher"
import { Fragment } from "react"

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Fragment>
        {children}
        <Switcher />
      </Fragment>
    </>
  )
}

export default Layout;