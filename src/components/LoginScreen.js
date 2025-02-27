import React, { useState } from 'react';

const LoginScreen = ({ onLogin }) => {
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState('');

	// Domyślny użytkownik
	const defaultUser = {
		id: 1,
		username: 'Martin Schneider',
		avatar: '👤', // Możemy później zastąpić to prawdziwym awatarem
	};

	// Funkcja do obsługi logowania z animacją
	const handleUserLogin = () => {
		setIsLoggingIn(true);

		// Sekwencja komunikatów ładowania
		const loadingMessages = [
			'Authenticating user...',
			'Loading user profile...',
			'Preparing desktop environment...',
			'Initializing user settings...',
			'Starting session...',
		];

		// Wyświetlanie sekwencji komunikatów
		loadingMessages.forEach((message, index) => {
			setTimeout(() => {
				setLoadingMessage(message);
			}, index * 600);
		});

		// Finalne zalogowanie po zakończeniu animacji
		setTimeout(() => {
			onLogin(defaultUser);
		}, loadingMessages.length * 600 + 300);
	};

	if (isLoggingIn) {
		return (
			<div className='h-full w-full bg-black flex flex-col items-center justify-center p-8'>
				<div className='text-center text-white font-mono'>
					<h2 className='text-xl mb-8'>Logging in as {defaultUser.username}</h2>
					<div className='flex items-center justify-center mb-6'>
						<div className='animate-spin h-10 w-10 border-t-4 border-blue-500 rounded-full'></div>
					</div>
					<p className='text-green-500'>{loadingMessage}</p>
				</div>
			</div>
		);
	}

	return (
		<div className='h-full w-full bg-blue-900 flex flex-col items-center justify-center p-8 font-mono'>
			<div className='mb-8 text-center text-white'>
				<h1 className='text-4xl font-bold mb-2'>QuantumFlux OS</h1>
				<p className='text-xl'>Please select a user</p>
			</div>

			<div className='bg-gray-200 p-6 w-full max-w-md border-2 border-white border-r-gray-700 border-b-gray-700 shadow-lg'>
				<h2 className='text-xl font-bold mb-6 text-center text-gray-800'>
					Who's using QuantumFlux today?
				</h2>

				{/* Istniejący użytkownik */}
				<div
					className='flex items-center p-3 bg-gray-300 mb-4 cursor-pointer border-2 border-gray-400 border-t-white border-l-white hover:bg-gray-400 transition-all'
					onClick={handleUserLogin}>
					<div className='bg-blue-800 text-white w-14 h-14 flex items-center justify-center text-2xl mr-4 border border-gray-800'>
						{defaultUser.avatar}
					</div>
					<div>
						<h3 className='text-lg font-bold'>{defaultUser.username}</h3>
						<p className='text-sm text-gray-600'>Click to login</p>
					</div>
				</div>

				{/* Dodaj nowego użytkownika - nieaktywny */}
				<div className='flex items-center p-3 bg-gray-300 opacity-50 cursor-not-allowed border-2 border-gray-400 border-t-white border-l-white'>
					<div className='bg-gray-600 text-white w-14 h-14 flex items-center justify-center text-2xl mr-4 border border-gray-800'>
						➕
					</div>
					<div>
						<h3 className='text-lg font-bold'>Add New User</h3>
						<p className='text-sm text-gray-600'>Currently unavailable</p>
					</div>
				</div>
			</div>

			<div className='mt-16 text-sm text-white border-t-2 border-blue-700 pt-4 w-full max-w-md text-center'>
				&copy; 2025 QuantumFlux OS by Martin Schneider
			</div>
		</div>
	);
};

export default LoginScreen;
