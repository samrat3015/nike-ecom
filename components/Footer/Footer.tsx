"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Footer() {
  const {
    settings = {},
    media = {},
    loading: settingsLoading = false,
    error: settingsError = null,
  } = useSelector((state: any) => state.settings ?? {});

  return (
    <footer className="footer_area border-t border-gray-200 py-10">
      {/* <pre>{JSON.stringify(settings, null, 2)}</pre> */}
      <div className="container">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-10">
          <div className="footer_widget">
            <div className="footer_content">
              <img src={media?.footer_logo} alt="footer logo" />
              <p className="mt-4">{settings?.attention_notice}</p>
            </div>
          </div>
          <div className="footer_widget">
            <h4 className="font-bold text-xl mb-4">Quick Links</h4>
            <ul>
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Services</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="copyright_area border-t border-gray-200 pt-6 mt-6">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="copyright_content">
              <p>
                Copyright &copy; {new Date().getFullYear()}{" "}
                {settings?.site_name}. All rights reserved.
              </p>
            </div>
            <div className="payment_image">
              <img className="h-16" src={media?.footer_payment_logo} alt="payment image" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
