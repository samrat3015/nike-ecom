"use client";

import { s } from "motion/react-client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Footer() {
  const {
    settings = {},
    media = {},
    loading: settingsLoading = false,
    error: settingsError = null,
  } = useSelector((state: any) => state.settings ?? {});

  const [pages, setPages] = useState([]);

  const fetchPageData = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/all-pages`);
      const data = await response.json();
      setPages(data);
      // Dispatch an action to update the Redux store with the fetched data
    } catch (error) {
      console.error("Error fetching footer data:", error);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  return (
    <footer className="footer_area border-t border-gray-200 py-10">
      <div className="container">
        {/* <pre>{JSON.stringify(settings, null, 2)}</pre> */}
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
              {pages.map((page) => (
                <li key={page.id}>
                  <a href={`/pages/${page.slug}`}>{page.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer_widget">
            <h4 className="font-bold text-xl mb-4">Follow Us</h4>
            <ul>
              <li>
                <a href={settings?.facebook_url}>Facebook</a>
              </li>
              <li>
                <a href={settings?.tiktok_url}>TikTok</a>
              </li>
              <li>
                <a href={settings?.instagram_url}>Instagram</a>
              </li>
              <li>
                <a href={settings?.x_url}>X</a>
              </li>
            </ul>
          </div>
          <div className="footer_widget">
            <div
              dangerouslySetInnerHTML={{ __html: settings?.facebook_iframe }}
            />
          </div>
        </div>
      </div>
      <div className="copyright_area border-t border-gray-200 pt-6 mt-6">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="copyright_content">
              <p>
                Copyright &copy; {new Date().getFullYear()}{" "}
                {settings?.site_name}. All rights reserved. developed by{" "}
                <a
                  href="https://auxtechbd.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Auxtech
                </a>
              </p>
            </div>
            <div className="payment_image">
              <img
                className="h-16"
                src={media?.footer_payment_logo}
                alt="payment image"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
