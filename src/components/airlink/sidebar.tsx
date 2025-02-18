"use client"

import {
    BarChart2,
    Workflow,
    Building2,
    Server,
    Folder,
    Database,
    Egg,
    HardDrive,
    MessagesSquare,
    Video,
    Settings,
    HelpCircle,
    Menu,
} from "lucide-react"

import { Home } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

export default function Sidebar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    function handleNavigation() {
        setIsMobileMenuOpen(false)
    }

    function NavItem({
        href,
        icon: Icon,
        children,
    }: {
        href: string
        icon: any
        children: React.ReactNode
    }) {
        return (
            <Link
                href={href}
                onClick={handleNavigation}
                className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-zinc-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
            >
                <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                {children}
            </Link>
        )
    }

    return (
        <>
            <button
                type="button"
                className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark bg-background shadow-md"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <nav
                className={`
                fixed inset-y-0 left-0 z-[70] w-64  dark bg-background transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 border-r border-gray-200 dark:border-[#1F1F23]
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
            >
                <div className="h-full flex flex-col">
                    <Link
                        href="https://kokonutui.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-[#1F1F23]"
                    >
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logo.png"
                                alt="Acme"
                                width={32}
                                height={32}
                                className="flex-shrink-0 hidden dark:block"
                            />
                            <Image
                                src="/logo.png"
                                alt="Acme"
                                width={32}
                                height={32}
                                className="flex-shrink-0 block dark:hidden"
                            />
                            <span className="text-lg font-semibold hover:cursor-pointer text-gray-900 dark:text-white">
                                AirLink
                            </span>
                        </div>
                    </Link>
                    {/* user only items */}
                    <div className="flex flex-col overflow-y-auto py-4 px-4 ">
                        <div className="p-5">
                            <NavItem href="#" icon={Home}>
                                Overview
                            </NavItem>
                            <NavItem href="#" icon={BarChart2}>
                                Settings
                            </NavItem>
                            <NavItem href="#" icon={Folder}>
                                Api
                            </NavItem>
                        </div>
                    </div>
                    {/* admin only items below */}
                    <h1 className="text-foreground flex items-center justify-center">Admin Controls</h1>
                    <div className="flex-1 overflow-y-auto py-4 px-4 ">
                        <div className="space-y-6 border p-5 rounded-xl">
                            <div className="">
                                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                                    BASIC ADMINISTRATION
                                </div>
                                <div className="space-y-1">
                                    <NavItem href="#" icon={Home}>
                                        Overview
                                    </NavItem>
                                    <NavItem href="#" icon={BarChart2}>
                                        Settings
                                    </NavItem>
                                    <NavItem href="#" icon={Folder}>
                                        Api
                                    </NavItem>
                                </div>
                            </div>

                            <div>
                                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                                    MANAGEMENT
                                </div>
                                <div className="space-y-1">
                                    <NavItem href="#" icon={Database}>
                                        Databases
                                    </NavItem>
                                    <NavItem href="#" icon={Workflow}>
                                        Nodes
                                    </NavItem>
                                    <NavItem href="#" icon={Server}>
                                        Servers
                                    </NavItem>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    )
}

