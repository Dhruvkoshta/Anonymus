"use client";

import React from "react";
import Link from "next/link";
import axios from "axios";
import { Button } from "./ui/button";
import { bricolage_grotesque } from "@/lib/fonts";
import { useDarkMode } from "@/hooks/useDarkMode";
import { MoonIcon, SunIcon } from "lucide-react";

function Navbar() {
	const { isDarkMode, toggleDarkMode } = useDarkMode();
	const [isAuthed, setIsAuthed] = React.useState(false);
	React.useEffect(() => {
		axios
			.get("/api/auth/me")
			.then((res) => {
				if (res.data.success) setIsAuthed(true);
				else setIsAuthed(false);
			})
			.catch(() => setIsAuthed(false));
	}, []);

	return (
		<nav className={`p-4 md:p-6 ${bricolage_grotesque}`}>
			<div className='container mx-auto flex md:flex-row justify-between items-center'>
				<a
					href='/'
					className={`text-2xl max-sm:text-lg font-bold max-sm:mb-0 mb-4 md:mb-0 flex max-sm:items-center`}
				>
					<span className='ml-[-3px]'>Anonymous</span>
				</a>

				<div className='flex items-center space-x-4'>
					<div onClick={toggleDarkMode}>
						<div className='flex items-center'>
							<button>
								{isDarkMode ? (
									<MoonIcon className='w-[18px] h-[18px] max-sm:w-[14px] max-sm:h-[14px]' />
								) : (
									<SunIcon className='w-5 h-5 max-sm:w-[15px] max-sm:h-[15px]' />
								)}
							</button>
						</div>
					</div>
					{isAuthed ? (
						<Button
							onClick={async () => {
								await axios.delete("/api/auth/login");
								location.href = "/sign-in";
							}}
							className='w-full md:w-auto dark:bg-white dark:text-black dark:hover:bg-gray-200 bg-black text-white hover:bg-gray-800 hover:text-white rounded-full px-8 h-8 max-sm:px-4 max-sm:h-7'
							variant='outline'
						>
							Logout
						</Button>
					) : (
						<Link href='/sign-in'>
							<Button
								className='w-full dark:bg-white dark:text-black dark:hover:bg-gray-200 bg-black text-white hover:bg-gray-800 hover:text-white rounded-full px-8 h-8 max-sm:px-4 max-sm:h-7'
								variant={"outline"}
							>
								Login
							</Button>
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
}

export default Navbar;
