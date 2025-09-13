import { bricolage_grotesque } from "@/lib/fonts";
import Link from "next/link";
import { RiGithubFill } from "react-icons/ri";

export default function Footer() {
	return (
		<footer className={`${bricolage_grotesque} p-5`}>
			<section className='flex justify-between items-center max-sm:flex-col max-sm:gap-1'>
				<div>
					<a
						href='/'
						className={`text-lg max-sm:text-lg font-bold flex items-center`}
					>
						<span className='ml-[-3px]'>Anonymous</span>
					</a>
				</div>
				<div className='text-sm space-x-1'>
					<span>Designed and Developed by</span>
					<Link
						href={"https://x.com/dhruvkoshta04"}
						target='_blank'
						className='underline text-orange-500 dark:text-orange-300'
					>
						Dhruv
					</Link>
				</div>
				<div className='flex gap-2'>
					<Link href={"https://github.com/dhruvkoshta"} target='_blank'>
						<RiGithubFill className='h-5 w-5 hover:fill-orange-500 dark:hover:fill-orange-300' />
					</Link>
				</div>
			</section>
		</footer>
	);
}
