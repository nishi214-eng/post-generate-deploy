"use client";

import Link from "next/link";
import "../style/header/header.css";

export const Header = () => {
    return (
      <header className="header">
        <nav>
          <ul className="link-list">
            <li>
              <Link href="/itemList" className="nav-link">
                収蔵品一覧
              </Link>
            </li>
            <li>
              <Link href="/addItem" className="nav-link">
                収蔵品登録
              </Link>
            </li>
            <li>
              <Link href="/trend" className="nav-link">
                ポスト
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    );
  };
  