import React, { useState, useEffect } from 'react';

const MemoPad = ({ app, onClose, onMinimize, onMaximize, isMaximized }) => {
	const [content, setContent] = useState('');
	const [isAnimating, setIsAnimating] = useState(false);
	const [savedState, setSavedState] = useState(null);

	// Sprawdź, czy istnieją zapisane dane dla tego notatnika
	useEffect(() => {
		const savedContent = localStorage.getItem(`memo-pad-content-${app.id}`);
		if (savedContent) {
			setContent(savedContent);
		}
	}, [app.id]);

	// Zapisz zawartość przy zamykaniu
	useEffect(() => {
		return () => {
			localStorage.setItem(`memo-pad-content-${app.id}`, content);
		};
	}, [app.id, content]);

	// Obsługa minimalizacji z animacją
	const handleMinimize = () => {
		setIsAnimating(true);
		setSavedState({
			transform: 'scale(1)',
			opacity: 1,
		});

		// Animacja minimalizacji
		setTimeout(() => {
			setSavedState({
				transform: 'scale(0.1)',
				opacity: 0,
				transition: 'all 300ms cubic-bezier(0.2, 0.8, 0.2, 1.0)',
			});

			// Po zakończeniu animacji wywołaj właściwą funkcję minimalizacji
			setTimeout(() => {
				setIsAnimating(false);
				onMinimize();
			}, 300);
		}, 10);
	};

	// Jeśli trwa animacja, pokaż element animacji
	if (isAnimating) {
		return (
			<div
				className='flex flex-col w-full h-full bg-gray-200 border border-gray-400'
				style={savedState}>
				<div className='window-drag-handle h-8 bg-blue-800 text-white flex items-center justify-between px-2'>
					<div className='flex items-center'>
						<span className='mr-2'>📝</span>
						<span>MemoPad</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col w-full h-full bg-gray-200 border border-gray-400'>
			{/* Pasek tytułowy z przyciskami */}
			<div className='window-drag-handle h-8 bg-blue-800 text-white flex items-center justify-between px-2'>
				<div className='flex items-center'>
					<span className='mr-2'>📝</span>
					<span>MemoPad</span>
				</div>
				<div className='flex items-center'>
					{/* Przyciski kontrolne okna */}
					<button
						className='w-6 h-6 mr-1 flex items-center justify-center bg-gray-300 text-black border border-gray-400 hover:bg-gray-400'
						onClick={handleMinimize}>
						_
					</button>
					<button
						className='w-6 h-6 mr-1 flex items-center justify-center bg-gray-300 text-black border border-gray-400 hover:bg-gray-400'
						onClick={onMaximize}>
						{isMaximized ? '❐' : '□'}
					</button>
					<button
						className='w-6 h-6 flex items-center justify-center bg-gray-300 text-black border border-gray-400 hover:bg-red-400'
						onClick={onClose}>
						✕
					</button>
				</div>
			</div>

			{/* Pasek menu */}
			<div className='flex items-center bg-gray-300 border-b border-gray-400 px-2 py-1'>
				<button className='px-2 py-0.5 hover:bg-gray-400'>Plik</button>
				<button className='px-2 py-0.5 hover:bg-gray-400'>Edycja</button>
				<button className='px-2 py-0.5 hover:bg-gray-400'>Widok</button>
				<button className='px-2 py-0.5 hover:bg-gray-400'>Pomoc</button>
			</div>

			{/* Obszar tekstu */}
			<textarea
				className='flex-grow p-2 font-mono text-sm focus:outline-none resize-none'
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder='Wpisz tekst tutaj...'
			/>

			{/* Pasek stanu */}
			<div className='h-6 bg-gray-300 border-t border-gray-400 px-2 flex items-center justify-between text-xs'>
				<div>
					Wierszy: {content.split('\n').length}, Znaków: {content.length}
				</div>
				<div>{new Date().toLocaleTimeString()}</div>
			</div>
		</div>
	);
};

export default MemoPad;
