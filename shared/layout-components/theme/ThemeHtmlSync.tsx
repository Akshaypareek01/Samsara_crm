"use client";

import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as switcherdata from "@/shared/data/switcherdata/switcherdata";
import { ThemeChanger } from "@/shared/redux/action";
import { Initialload } from "@/shared/contextapi";

type ThemeState = {
  dir?: string;
  class?: string;
  dataHeaderStyles?: string;
  dataVerticalStyle?: string;
  dataNavLayout?: string;
  dataMenuStyles?: string;
  dataToggled?: string;
  dataNavStyle?: string;
  horStyle?: string;
  dataPageStyle?: string;
  dataWidth?: string;
  dataMenuPosition?: string;
  dataHeaderPosition?: string;
  iconOverlay?: string;
  bgImg?: string;
  iconText?: string;
  body?: string;
  colorPrimaryRgb?: string;
  colorPrimary?: string;
  darkBg?: string;
  bodyBg?: string;
  inputBorder?: string;
  Light?: string;
};

/**
 * Mirrors Redux theme state onto document.documentElement for routes
 * outside the (components) layout group (trainer/company dashboards).
 */
const ThemeHtmlSync: React.FC = () => {
  const theme = useSelector((state: ThemeState) => state);
  const dispatch = useDispatch();
  const initialLoad = useContext(Initialload);

  useEffect(() => {
    if (typeof window === "undefined" || initialLoad.pageloading) return;
    switcherdata.LocalStorageBackup(
      (value: ThemeState) => dispatch(ThemeChanger(value) as never),
      initialLoad.setpageloading
    );
  }, [dispatch, initialLoad]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;

    const setOrRemove = (attr: string, value: string | undefined) => {
      if (value) {
        html.setAttribute(attr, value);
      } else {
        html.removeAttribute(attr);
      }
    };

    html.dir = theme.dir ?? "ltr";
    html.className = theme.class ?? "";

    setOrRemove("data-header-styles", theme.dataHeaderStyles);
    setOrRemove("data-vertical-style", theme.dataVerticalStyle);
    setOrRemove("data-nav-layout", theme.dataNavLayout);
    setOrRemove("data-menu-styles", theme.dataMenuStyles);
    setOrRemove("data-toggled", theme.dataToggled);
    setOrRemove("data-nav-style", theme.dataNavStyle);
    setOrRemove("hor-style", theme.horStyle);
    setOrRemove("data-page-style", theme.dataPageStyle);
    setOrRemove("data-width", theme.dataWidth);
    setOrRemove("data-menu-position", theme.dataMenuPosition);
    setOrRemove("data-header-position", theme.dataHeaderPosition);
    setOrRemove("data-icon-overlay", theme.iconOverlay);
    setOrRemove("bg-img", theme.bgImg);
    setOrRemove("data-icon-text", theme.iconText);

    if (theme.body) {
      document.body.className = theme.body;
    }

    const customStyles: Record<string, string> = {};
    if (theme.colorPrimaryRgb) customStyles["--primary-rgb"] = theme.colorPrimaryRgb;
    if (theme.colorPrimary) customStyles["--primary"] = theme.colorPrimary;
    if (theme.darkBg) customStyles["--dark-bg"] = theme.darkBg;
    if (theme.bodyBg) customStyles["--body-bg"] = theme.bodyBg;
    if (theme.inputBorder) customStyles["--input-border"] = theme.inputBorder;
    if (theme.Light) customStyles["--light"] = theme.Light;

    Object.entries(customStyles).forEach(([key, value]) => {
      html.style.setProperty(key, value);
    });
  }, [
    theme.dir,
    theme.class,
    theme.dataHeaderStyles,
    theme.dataVerticalStyle,
    theme.dataNavLayout,
    theme.dataMenuStyles,
    theme.dataToggled,
    theme.dataNavStyle,
    theme.horStyle,
    theme.dataPageStyle,
    theme.dataWidth,
    theme.dataMenuPosition,
    theme.dataHeaderPosition,
    theme.iconOverlay,
    theme.bgImg,
    theme.iconText,
    theme.body,
    theme.colorPrimaryRgb,
    theme.colorPrimary,
    theme.darkBg,
    theme.bodyBg,
    theme.inputBorder,
    theme.Light,
  ]);

  return null;
};

export default ThemeHtmlSync;
