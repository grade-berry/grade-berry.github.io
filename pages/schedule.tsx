import React, { useState, useEffect } from "react";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/router";
import { Schedule as ScheduleType } from "../utils/schedule";
import Head from "next/head";

interface ScheduleProps {
	client: any;
	createError:(message:string)=>void;
}

export default function Schedule({ client,createError }: ScheduleProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [schedule, setSchedule] = useState<any>();
	const [term, setTerm] = useState<any>();
	const [today,setToday]=useState<boolean>(true);

	function update(e){
		if(e=="today"){setToday(true);setTerm("today")}else{
		delete client.loadedSchedule;
		setToday(false);
		setTerm(parseInt(e.target.value))
		}
	}
	useEffect(() => {
		try {
			if(!client.loadedSchedule&&term!='today'){
			setLoading(true);
			client.schedule(term).then(([res]) => {
				client.loadedSchedule=res;
				console.log("schedule is here",res);
				setSchedule(res);
				setLoading(false);
			}).catch(err=>{createError(err.message)});}else{setSchedule(client.loadedSchedule);setLoading(false)}
		} catch {
			if (localStorage.getItem("remember") === "false") {
				console.log("womp womp")
			}
		}
	}, [client, term]);

	return (
		<div className="p-5 md:p-10 h-full flex-1">
			<Head>
				<title>Schedule - Grade Melon</title>
			</Head>
			{loading ? (
				<div className="flex justify-center">
					<Spinner size="xl" color="pink" />
				</div>
			) : (
				<div className="max-w-max">
					<select
						id="periods"
						value={term ? term : "today"}
						onChange={(e) => (update(e))}
						className="h-11 mb-5 block w-full p-2 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
					>
						<option key={0} value={"today"}>Today</option>
						{schedule?.terms.map((term) => (
							<option key={term.termIndex+1} value={term.termIndex}>
								{term.termName}
							</option>
						))}
					</select>

					{(!schedule.concurrent && !today) && <div className="max-w-max overflow-x-auto shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
						<table className="text-sm text-left text-gray-500 dark:text-gray-400">
							<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
								<tr>
									<th scope="col" className="py-3 pl-6">
										Period
									</th>
									<th scope="col" className="py-3 px-6">
										Course Name
									</th>
									<th scope="col" className="py-3 px-6">
										Room
									</th>
									<th scope="col" className="py-3 px-6">
										Teacher
									</th>
								</tr>
							</thead>
							<tbody>
								{schedule.mainClasses.map(({ period, name, room, teacher }, i) => (
									<tr
										className={`bg-${
											i % 2 == 0 ? "white" : "gray-50"
										} border-b dark:bg-gray-${
											i % 2 == 0 ? 900 : 800
										} dark:border-gray-700`}
										key={i}
									>
										<th
											scope="row"
											className="py-4 pl-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
										>
											{period ? period : i}
										</th>
										<td className="py-4 px-6">{name}</td>
										<td className="py-4 px-6">{room}</td>
										<td className="py-4 px-6">
										{teacher}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
}
{(schedule.conClasses&&!today) && <div className="max-w-max overflow-x-auto shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
						<table className="text-sm text-left text-gray-500 dark:text-gray-400">
							<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
								<tr>
									<th scope="col" className="py-3 pl-6">
										Period
									</th>
									<th scope="col" className="py-3 px-6">
										Course Name
									</th>
									<th scope="col" className="py-3 px-6">
										Room
									</th>
									<th scope="col" className="py-3 px-6">
										Teacher
									</th>
								</tr>
							</thead>
							<tbody>
								{schedule.mainClasses.map(({ period, name, room, teacher }, i) => (
									<tr
										className={`bg-${
											i % 2 == 0 ? "white" : "gray-50"
										} border-b dark:bg-gray-${
											i % 2 == 0 ? 900 : 800
										} dark:border-gray-700`}
										key={i}
									>
										<th
											scope="row"
											className="py-4 pl-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
										>
											{period ? period : i}
										</th>
										<td className="py-4 px-6">{name}</td>
										<td className="py-4 px-6">{room}</td>
										<td className="py-4 px-6">
											{teacher}
										</td>
									</tr>
								))}
								<tr>
									<td colSpan={4}><ul></ul></td>
								</tr>
								{schedule.conClasses.map(({ period, name, room, teacher }, i) => {
									i=i+schedule.mainClasses.length-1;
									return(
									<tr
										className={`bg-${
											i % 2 == 0 ? "white" : "gray-50"
										} border-b dark:bg-gray-${
											i % 2 == 0 ? 900 : 800
										} dark:border-gray-700`}
										key={i}
									>
										<th
											scope="row"
											className="py-4 pl-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
										>
											{period ? period : i}
										</th>
										<td className="py-4 px-6">{name}</td>
										<td className="py-4 px-6">{room}</td>
										<td className="py-4 px-6">
										{teacher}
										</td>
									</tr>
								)})}

							</tbody>
						</table>
					</div>}

		{today && <div className="max-w-max overflow-x-auto shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
						<table className="text-sm text-left text-gray-500 dark:text-gray-400">
							<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
								<tr>
									<th scope="col" className='py-3 px-6'>
										Time
									</th>
									<th scope="col" className="py-3 px-6">
										Period
									</th>
									<th scope="col" className="py-3 px-6">
										Course Name
									</th>
									<th scope="col" className="py-3 px-6">
										Room
									</th>
									<th scope="col" className="py-3 px-6">
										Teacher
									</th>
								</tr>
							</thead>
							<tbody>
								{schedule.today.main.map(({ start,end,period, name, room, teacher }, i) => (
									<tr
										className={`bg-${
											i % 2 == 0 ? "white" : "gray-50"
										} border-b dark:bg-gray-${
											i % 2 == 0 ? 900 : 800
										} dark:border-gray-700`}
										key={i}
									>
										<th
											scope="row"
											className="py-4 px-6 font-medium text-gray-900 dark:text-white"
										>
											{start+" - "+end}
										</th>
										<td className='py-4 px-6'>{period ? period : i}</td>
										<td className="py-4 px-6">{name}</td>
										<td className="py-4 px-6">{room}</td>
										<td className="py-4 px-6">
											{teacher}
										</td>
									</tr>
								))}
								{schedule.today.con && (
									<tr><td colSpan={5}><hr/></td></tr>
								)}
								{schedule.today.con &&( 
								schedule.today.con.map(({ start,end,period, name, room, teacher }, i) => {
									i=i+schedule.today.main.length;
									return(
									<tr
										className={`bg-${
											i % 2 == 0 ? "white" : "gray-50"
										} border-b dark:bg-gray-${
											i % 2 == 0 ? 900 : 800
										} dark:border-gray-700`}
										key={i}
									>
										<th
											scope="row"
											className="py-4 pl-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
										>
										{start+" - "+end}
										</th>
										<td className='py-4 px-6'>{period ? period : i}</td>
										<td className="py-4 px-6">{name}</td>
										<td className="py-4 px-6">{room}</td>
										<td className="py-4 px-6">
											{teacher}
										</td>
									</tr>
								)}))}
									




							</tbody>
						</table>
					</div>}

				</div>
			)}
		</div>
	);
}
