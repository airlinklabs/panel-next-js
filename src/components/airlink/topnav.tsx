"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/shadcn/dropdown-menu"
import Image from "next/image"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/shadcn/breadcrumb";
import { Bell, ChevronRight, Home } from "lucide-react"

import Link from "next/link"

interface BreadcrumbItem {
    label: string
    href?: string
}

export default function TopNav() {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: "kokonutUI", href: "#" },
        { label: "dashboard", href: "#" },
    ]

    return (
        <nav className="px-3 sm:px-6 flex items-center justify-between dark bg-background border-b   h-full">
            <div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#">
                                <Home size={16} strokeWidth={2} aria-hidden="true" />
                                <span className="sr-only">Home</span>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Home</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
                <button
                    type="button"
                    className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors"
                >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                        <Image
                            src="/logo.png"
                            alt="User avatar"
                            width={28}
                            height={28}
                            className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] sm:w-8 sm:h-8 cursor-pointer"
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
                    >
                        {/* <Profile01 avatar="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png" /> */}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    )
}

