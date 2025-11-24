'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Header.module.css';

/**
 * Main navigation header component for Cadence platform.
 * Features logo, navigation links, and responsive mobile menu.
 */
export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.container}>
                    {/* Logo */}
                    <Link href="/" className={styles.logoSection}>
                        <Image
                            src="/cadence-logo-full.png"
                            alt="Cadence - AI Powered"
                            width={180}
                            height={140}
                            className={styles.logoImage}
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className={styles.nav}>
                        <ul className={styles.navLinks}>
                            <li>
                                <Link href="/features" className={styles.navLink}>
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className={styles.navLink}>
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className={styles.navLink}>
                                    About
                                </Link>
                            </li>
                        </ul>
                        <Link href="/login" className={styles.ctaButton}>
                            Get Started
                        </Link>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={styles.menuToggle}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav className={styles.navMobile}>
                        <ul className={styles.navLinks}>
                            <li>
                                <Link
                                    href="/features"
                                    className={styles.navLink}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pricing"
                                    className={styles.navLink}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className={styles.navLink}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/login"
                                    className={styles.ctaButton}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </li>
                        </ul>
                    </nav>
                )}
            </header>

        </>
    );
}
