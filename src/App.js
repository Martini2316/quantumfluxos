import React, { useState, useEffect } from 'react';
import BootScreen from './components/BootScreen';
import LoginScreen from './components/LoginScreen';
import Desktop from './components/Desktop';

function App() {
	// Stany aplikacji: 'booting', 'login', 'desktop', 'transition'
	const [systemState, setSystemState] = useState('booting');
	const [currentUser, setCurrentUser] = useState(null);
	const [fadeOut, setFadeOut] = useState(false);

	// Sprawdzanie czy użytkownik był już zalogowany
	useEffect(() => {
		const loggedInUser = localStorage.getItem('currentUser');

		if (loggedInUser) {
			setCurrentUser(JSON.parse(loggedInUser));
			setSystemState('desktop');
		} else {
			// Symulacja ładowania systemu
			const bootTimer = setTimeout(() => {
				setFadeOut(true);
				setTimeout(() => {
					setSystemState('login');
					setFadeOut(false);
				}, 500);
			}, 3000);

			return () => clearTimeout(bootTimer);
		}
	}, []);

	// Funkcja do obsługi logowania
	const handleLogin = (user) => {
		setCurrentUser(user);
		localStorage.setItem('currentUser', JSON.stringify(user));

		// Dodajemy efekt przejścia
		setFadeOut(true);
		setTimeout(() => {
			setSystemState('desktop');
			setTimeout(() => {
				setFadeOut(false);
			}, 100);
		}, 500);
	};

	// Funkcja do obsługi wylogowania
	const handleLogout = () => {
		setFadeOut(true);
		setTimeout(() => {
			setCurrentUser(null);
			localStorage.removeItem('currentUser');
			setSystemState('login');
			setTimeout(() => {
				setFadeOut(false);
			}, 100);
		}, 500);
	};

	// Renderowanie odpowiedniego komponentu w zależności od stanu systemu
	const renderContent = () => {
		switch (systemState) {
			case 'booting':
				return <BootScreen />;
			case 'login':
				return <LoginScreen onLogin={handleLogin} />;
			case 'desktop':
				return <Desktop user={currentUser} onLogout={handleLogout} />;
			default:
				return <BootScreen />;
		}
	};

	return (
		<div
			className={`h-screen w-screen overflow-hidden transition-opacity duration-500 ${
				fadeOut ? 'opacity-0' : 'opacity-100'
			}`}>
			{renderContent()}
		</div>
	);
}

export default App;
