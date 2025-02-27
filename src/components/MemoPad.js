import React, { useState, useEffect, useRef } from 'react';

const MemoPad = ({
	app,
	onClose,
	onMinimize,
	onMaximize,
	isMaximized,
	addDesktopIcon,
}) => {
	const [content, setContent] = useState('');
	const [isAnimating, setIsAnimating] = useState(false);
	const [savedState, setSavedState] = useState(null);
	const [fileMenuOpen, setFileMenuOpen] = useState(false);
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const [fileName, setFileName] = useState('');
	const [isSaved, setIsSaved] = useState(false);
	const [filePath, setFilePath] = useState(null);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [pendingAction, setPendingAction] = useState(null);
	const textareaRef = useRef(null);
	const autosaveTimerRef = useRef(null);

	// Wczytywanie zawartości pliku jeśli otwieramy istniejący plik
	useEffect(() => {
		// Sprawdź czy to otwieranie istniejącego pliku
		if (app?.fileData) {
			// Ustaw nazwę pliku
			setFileName(app.fileData.name);
			// Ustaw zawartość
			setContent(app.fileData.content || '');
			// Ustaw ścieżkę pliku
			setFilePath('desktop');
			// Oznacz jako zapisany
			setIsSaved(true);
		}

		return () => {
			// Sprzątanie timeoutów przy zamknięciu
			if (autosaveTimerRef.current) {
				clearTimeout(autosaveTimerRef.current);
			}
		};
	}, [app]);

	// Autosave dla już zapisanych plików
	useEffect(() => {
		if (filePath && isSaved) {
			if (autosaveTimerRef.current) {
				clearTimeout(autosaveTimerRef.current);
			}

			autosaveTimerRef.current = setTimeout(() => {
				saveFile(filePath, fileName, false);
			}, 5000);
		}

		return () => {
			if (autosaveTimerRef.current) {
				clearTimeout(autosaveTimerRef.current);
			}
		};
	}, [content, filePath, isSaved, fileName]);

	// Obsługa skrótu klawiszowego Ctrl+S
	useEffect(() => {
		const handleKeyDown = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				if (isSaved && filePath) {
					saveFile(filePath, fileName, false);
				} else {
					openSaveDialog();
				}
			} else if (
				e.key === 'Tab' &&
				textareaRef.current === document.activeElement
			) {
				e.preventDefault();
				// Wstawianie tabulatora (4 spacje) zamiast przenoszenia fokusa
				const start = textareaRef.current.selectionStart;
				const end = textareaRef.current.selectionEnd;
				const newContent =
					content.substring(0, start) + '    ' + content.substring(end);
				setContent(newContent);

				// Ustawienie kursora po tabie
				setTimeout(() => {
					textareaRef.current.selectionStart = start + 4;
					textareaRef.current.selectionEnd = start + 4;
				}, 0);
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [content, isSaved, filePath, fileName]);

	// Funkcja otwierająca dialog zapisu
	const openSaveDialog = () => {
		setFileMenuOpen(false);
		setConfirmDialogOpen(false);
		setSaveDialogOpen(true);
	};

	// Funkcja zapisująca plik
	const saveFile = (path, name, showConfirmation = true) => {
		if (!name) return;

		// Upewnij się, że nazwa ma rozszerzenie .mep
		const fileName = name.endsWith('.mep') ? name : `${name}.mep`;

		const fileData = {
			name: fileName,
			content: content,
			lastModified: new Date().toISOString(),
			type: 'memo-pad',
		};

		// Zapisz do localStorage (symulacja systemu plików)
		const filesData = JSON.parse(
			localStorage.getItem('quantumflux-files') || '{}'
		);
		const desktopFiles = filesData.desktop || [];

		// Sprawdź czy plik już istnieje
		const existingFileIndex = desktopFiles.findIndex(
			(file) => file.name === fileData.name && file.type === fileData.type
		);

		if (existingFileIndex !== -1) {
			// Aktualizuj istniejący plik
			desktopFiles[existingFileIndex] = fileData;
		} else {
			// Dodaj nowy plik
			desktopFiles.push(fileData);
			// Dodaj ikonę na pulpicie
			if (addDesktopIcon) {
				addDesktopIcon({
					id: `file-${Date.now()}`,
					name: fileData.name,
					icon: '📄',
					appType: 'memo-pad',
					fileData: fileData,
					x: 100 + Math.random() * 200,
					y: 100 + Math.random() * 200,
					selected: false,
				});
			}
		}

		filesData.desktop = desktopFiles;
		localStorage.setItem('quantumflux-files', JSON.stringify(filesData));

		// Aktualizuj stan
		setFilePath('desktop');
		setFileName(fileData.name);
		setIsSaved(true);
		setSaveDialogOpen(false);

		if (showConfirmation) {
			// Tutaj możesz dodać powiadomienie o zapisie
			console.log('Plik zapisany:', fileData.name);
		}
	};

	// Obsługa zamykania
	const handleClose = () => {
		// Jeśli są niezapisane zmiany, pokaż dialog potwierdzenia
		if (
			!isSaved ||
			(filePath &&
				isSaved &&
				content !== localStorage.getItem(`quantumflux-${filePath}-${fileName}`))
		) {
			setConfirmDialogOpen(true);
			setPendingAction('close');
		} else {
			// Jeśli wszystko zapisane, po prostu zamknij
			onClose();
		}
	};

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

	// Zamykanie menu po kliknięciu poza nim
	useEffect(() => {
		const handleClickOutside = () => {
			setFileMenuOpen(false);
		};

		if (fileMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [fileMenuOpen]);

	// Obsługa potwierdzenia w dialogu
	const handleConfirmAction = () => {
		if (pendingAction === 'close') {
			onClose();
		} else if (pendingAction === 'save-and-close') {
			setSaveDialogOpen(true);
			setConfirmDialogOpen(false);
		}
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

	// Okno główne aplikacji
	return (
		<div className='flex flex-col w-full h-full bg-gray-200 border border-gray-400'>
			{/* Pasek tytułowy z przyciskami */}
			<div className='window-drag-handle h-8 bg-blue-800 text-white flex items-center justify-between px-2'>
				<div className='flex items-center'>
					<span className='mr-2'>📝</span>
					<span>MemoPad {fileName ? `- ${fileName}` : ''}</span>
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
						onClick={handleClose}>
						✕
					</button>
				</div>
			</div>

			{/* Pasek menu */}
			<div className='flex items-center bg-gray-300 border-b border-gray-400 px-2 py-1 relative'>
				<div className='relative'>
					<button
						className={`px-2 py-0.5 ${
							fileMenuOpen ? 'bg-gray-400' : 'hover:bg-gray-400'
						}`}
						onClick={(e) => {
							e.stopPropagation();
							setFileMenuOpen(!fileMenuOpen);
						}}>
						Plik
					</button>

					{/* Menu Plik */}
					{fileMenuOpen && (
						<div
							className='absolute top-full left-0 bg-gray-300 border border-gray-700 shadow-lg z-50 w-48'
							onClick={(e) => e.stopPropagation()}>
							<button
								className='w-full text-left px-4 py-1 hover:bg-blue-100 flex items-center'
								onClick={() => {
									setFileMenuOpen(false);
									setContent('');
									setFileName('');
									setFilePath(null);
									setIsSaved(false);
								}}>
								<span className='mr-2'>📄</span> Nowy
							</button>
							<button
								className='w-full text-left px-4 py-1 hover:bg-blue-100 flex items-center'
								onClick={() => {
									setFileMenuOpen(false);
									openSaveDialog();
								}}>
								<span className='mr-2'>💾</span> Zapisz
							</button>
							<div className='border-t border-gray-500 my-1'></div>
							<button
								className='w-full text-left px-4 py-1 hover:bg-blue-100 flex items-center'
								onClick={handleClose}>
								<span className='mr-2'>🚪</span> Zamknij
							</button>
						</div>
					)}
				</div>
				<button className='px-2 py-0.5 hover:bg-gray-400'>Edycja</button>
				<button className='px-2 py-0.5 hover:bg-gray-400'>Widok</button>
				<button className='px-2 py-0.5 hover:bg-gray-400'>Pomoc</button>
			</div>

			{/* Obszar tekstu */}
			<textarea
				ref={textareaRef}
				className='flex-grow p-2 font-mono text-sm focus:outline-none resize-none'
				value={content}
				onChange={(e) => {
					setContent(e.target.value);
					if (isSaved) {
						// Jeśli był zapisany, a teraz są zmiany, oznacz jako zmieniony
						setIsSaved(false);
					}
				}}
				placeholder='Wpisz tekst tutaj...'
			/>

			{/* Pasek stanu */}
			<div className='h-6 bg-gray-300 border-t border-gray-400 px-2 flex items-center justify-between text-xs'>
				<div>
					Wierszy: {content.split('\n').length}, Znaków: {content.length}
				</div>
				<div>
					{isSaved ? 'Zapisano' : 'Niezapisany'} |{' '}
					{new Date().toLocaleTimeString()}
				</div>
			</div>

			{/* Dialog zapisywania */}
			{saveDialogOpen && (
				<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
					<div className='bg-gray-200 border-2 border-gray-700 p-4 w-96 shadow-xl'>
						<div className='text-lg font-bold mb-4'>Zapisz plik</div>

						<div className='mb-4'>
							<div className='mb-1 font-bold'>Lokalizacja:</div>
							<div className='flex items-center bg-gray-100 p-2 border border-gray-400'>
								<span className='mr-2'>📁</span>
								<span>Pulpit</span>
							</div>
						</div>

						<div className='mb-4'>
							<div className='mb-1 font-bold'>Nazwa pliku:</div>
							<input
								type='text'
								className='w-full p-2 border border-gray-400'
								value={fileName}
								onChange={(e) => setFileName(e.target.value)}
								placeholder='Nazwa pliku'
								autoFocus
							/>
							<div className='text-xs text-gray-500 mt-1'>
								Rozszerzenie .mep zostanie dodane automatycznie
							</div>
						</div>

						<div className='flex justify-end space-x-2'>
							<button
								className='px-4 py-2 border border-gray-400 bg-gray-300 hover:bg-gray-400'
								onClick={() => setSaveDialogOpen(false)}>
								Anuluj
							</button>
							<button
								className='px-4 py-2 border border-gray-400 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200'
								onClick={() => {
									saveFile('desktop', fileName);
									if (pendingAction === 'save-and-close') {
										onClose();
									}
								}}
								disabled={!fileName.trim()}>
								Zapisz
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Dialog potwierdzenia */}
			{confirmDialogOpen && (
				<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
					<div className='bg-gray-200 border-2 border-gray-700 p-4 w-96 shadow-xl'>
						<div className='text-lg font-bold mb-4'>Niezapisane zmiany</div>

						<div className='mb-4'>
							Dokument zawiera niezapisane zmiany. Czy chcesz zapisać zmiany
							przed zamknięciem?
						</div>

						<div className='flex justify-end space-x-2'>
							<button
								className='px-4 py-2 border border-gray-400 bg-gray-300 hover:bg-gray-400'
								onClick={() => setConfirmDialogOpen(false)}>
								Anuluj
							</button>
							<button
								className='px-4 py-2 border border-gray-400 bg-gray-300 hover:bg-gray-400'
								onClick={handleConfirmAction}>
								Nie zapisuj
							</button>
							<button
								className='px-4 py-2 border border-gray-400 bg-blue-600 text-white hover:bg-blue-700'
								onClick={() => {
									setPendingAction('save-and-close');
									setConfirmDialogOpen(false);
									setSaveDialogOpen(true);
								}}>
								Zapisz
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MemoPad;
