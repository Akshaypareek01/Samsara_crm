"use client"
import PrelineScript from "@/app/PrelineScript"
import Backtotop from "@/shared/layout-components/backtotop/backtotop"
import Footer from "@/shared/layout-components/footer/footer"
import Header from "@/shared/layout-components/header/header"
import Sidebar from "@/shared/layout-components/sidebar/sidebar"
import Switcher from "@/shared/layout-components/switcher/switcher"
import { ThemeChanger } from "@/shared/redux/action"
import { Fragment, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import AuthGuard from "@/shared/components/AuthGuard"

const Layout = ({ children, }: any) => {

  const dispatch = useDispatch();
  const theme = useSelector((state: any) => state);
  const [MyclassName, setMyClass] = useState("");

  const Bodyclickk = () => {
    if (localStorage.getItem("ynexverticalstyles") == "icontext") {
      setMyClass("");
    }
    if (window.innerWidth > 992) {
      if (theme.iconOverlay === 'open') {
        dispatch(ThemeChanger({ ...theme, iconOverlay: "" }) as any);
      }
    }
  }

  return (
    <>
      <AuthGuard>
        <Fragment>
          <Switcher />
          <div className='page'>
            <Header />
            <Sidebar />
            <div className='content'>
              <div className='main-content'
                onClick={Bodyclickk}
              >
                {children}
              </div>
            </div>
            <Footer />
          </div>
          <Backtotop />
          <PrelineScript />
        </Fragment>
      </AuthGuard>
    </>
  )
}

export default Layout;
