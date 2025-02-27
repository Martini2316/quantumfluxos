import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import MemoPad from './MemoPad';
// Zalecamy umieszczenie obrazka w folderze public/wallpaper/ i użycie poniższej ścieżki

const Desktop = ({ user, onLogout }) => {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectionBox, setSelectionBox] = useState(null);
	const desktopRef = useRef(null);

	// Stan dla ikon pulpitu
	const [desktopIcons, setDesktopIcons] = useState([
		{
			id: 'command-prompt',
			name: 'CommandX',
			icon: '💻',
			x: 20,
			y: 20,
			selected: false,
		},
		{
			id: 'trash',
			name: 'Kosz',
			icon: '🗑️',
			x: 20,
			y: 120,
			selected: false,
		},
		{
			id: 'pixel-studio',
			name: 'PixelStudio',
			icon: '🎨',
			x: 20,
			y: 220,
			selected: false,
		},
		{
			id: 'memo-pad',
			name: 'MemoPad',
			icon: '📝',
			x: 20,
			y: 320,
			selected: false,
		},
		{
			id: 'flux-code',
			name: 'FluxCode',
			icon: '⚙️',
			x: 20,
			y: 420,
			selected: false,
		},
	]);

	// Stan aplikacji
	const [openApps, setOpenApps] = useState([]);
	const [minimizedApps, setMinimizedApps] = useState([]);

	// Aktualizacja czasu co minutę
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000);

		return () => clearInterval(timer);
	}, []);

	// Obsługa kliknięcia przycisku Start
	const toggleStartMenu = () => {
		setIsStartMenuOpen(!isStartMenuOpen);
	};

	// Obsługa wylogowania
	const handleLogout = () => {
		onLogout();
	};

	// Handler dla selection box
	const handleMouseDown = (e) => {
		// Upewnij się, że kliknięcie było na pulpicie, a nie na menu start, ikonie lub oknie aplikacji
		if (
			(isStartMenuOpen && e.target.closest('.start-menu')) ||
			e.target.closest('.icon-drag-handle') ||
			e.target.closest('.app-window')
		) {
			return;
		}

		// Zamknij menu start przy kliknięciu na pulpit
		if (isStartMenuOpen) {
			setIsStartMenuOpen(false);
		}

		// Usuń zaznaczenie ikon przy kliknięciu na pusty obszar pulpitu
		setDesktopIcons((icons) =>
			icons.map((icon) => ({
				...icon,
				selected: false,
			}))
		);

		// Początkowa pozycja selection box
		const startX = e.clientX;
		const startY = e.clientY;

		// Ustawienie danych dla selection box
		setSelectionBox({
			startX,
			startY,
			endX: startX,
			endY: startY,
			isVisible: true,
		});

		// Obsługa ruchu myszy
		const handleMouseMove = (e) => {
			setSelectionBox((prev) => ({
				...prev,
				endX: e.clientX,
				endY: e.clientY,
			}));

			// Sprawdź, które ikony są w selection box
			if (desktopRef.current) {
				const selectionLeft = Math.min(startX, e.clientX);
				const selectionTop = Math.min(startY, e.clientY);
				const selectionRight = Math.max(startX, e.clientX);
				const selectionBottom = Math.max(startY, e.clientY);

				// Aktualizuj zaznaczenie ikon
				setDesktopIcons((icons) =>
					icons.map((icon) => {
						const iconElem = document.getElementById(`icon-${icon.id}`);
						let selected = false;

						if (iconElem) {
							const rect = iconElem.getBoundingClientRect();
							const iconCenterX = rect.left + rect.width / 2;
							const iconCenterY = rect.top + rect.height / 2;

							selected =
								iconCenterX >= selectionLeft &&
								iconCenterX <= selectionRight &&
								iconCenterY >= selectionTop &&
								iconCenterY <= selectionBottom;
						}

						return {
							...icon,
							selected,
						};
					})
				);
			}
		};

		// Obsługa puszczenia przycisku myszy
		const handleMouseUp = () => {
			setSelectionBox((prev) => ({
				...prev,
				isVisible: false,
			}));

			// Usunięcie event listenerów
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		// Dodanie event listenerów
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	// Obsługa zmiany pozycji ikony
	const handleIconDragStop = (id, d) => {
		// Ustaw nową pozycję ikony z wyrównaniem do siatki (np. co 10 pikseli)
		const gridSize = 10;
		const newX = Math.round(d.x / gridSize) * gridSize;
		const newY = Math.round(d.y / gridSize) * gridSize;

		// Sprawdź, czy ikona jest zaznaczona
		const draggedIcon = desktopIcons.find((icon) => icon.id === id);
		const isSelected = draggedIcon && draggedIcon.selected;

		// Jeśli ikona jest zaznaczona, przesuń wszystkie zaznaczone ikony
		if (isSelected) {
			const selectedIcons = desktopIcons.filter((icon) => icon.selected);

			if (selectedIcons.length > 1) {
				// Oblicz przesunięcie względem poprzedniej pozycji
				const deltaX = newX - draggedIcon.x;
				const deltaY = newY - draggedIcon.y;

				// Zaktualizuj pozycje wszystkich zaznaczonych ikon
				setDesktopIcons((icons) =>
					icons.map((icon) => {
						if (icon.selected) {
							// Oblicz nową pozycję i dopasuj do siatki
							const updatedX =
								Math.round((icon.x + deltaX) / gridSize) * gridSize;
							const updatedY =
								Math.round((icon.y + deltaY) / gridSize) * gridSize;
							return { ...icon, x: updatedX, y: updatedY };
						}
						return icon;
					})
				);
			} else {
				// Jeśli tylko jedna ikona jest zaznaczona, po prostu zaktualizuj jej pozycję
				setDesktopIcons((icons) =>
					icons.map((icon) =>
						icon.id === id ? { ...icon, x: newX, y: newY } : icon
					)
				);
			}
		} else {
			// Jeśli ikona nie jest zaznaczona, zaktualizuj tylko jej pozycję
			setDesktopIcons((icons) =>
				icons.map((icon) =>
					icon.id === id ? { ...icon, x: newX, y: newY } : icon
				)
			);
		}
	};

	// Obsługa podwójnego kliknięcia na ikony
	const handleDoubleClick = (appId) => {
		// Sprawdź, czy aplikacja jest już otwarta
		if (!openApps.some((app) => app.id === appId)) {
			// Otwórz aplikację
			const appToOpen = desktopIcons.find((icon) => icon.id === appId);
			if (appToOpen) {
				setOpenApps((prev) => [
					...prev,
					{
						id: appId,
						name: appToOpen.name,
						icon: appToOpen.icon,
						windowState: 'normal', // normal, maximized
						zIndex: openApps.length + 1,
						position: {
							x: 100 + openApps.length * 30,
							y: 100 + openApps.length * 30,
						},
						size: {
							width: 600,
							height: 400,
						},
					},
				]);
			}
		} else {
			// Jeśli aplikacja jest zminimalizowana, przywróć ją
			const isMinimized = minimizedApps.includes(appId);
			if (isMinimized) {
				handleRestoreApp(appId);
			}
		}
	};

	// Obsługa zmiany aktywnego okna (przeniesienie na wierzch)
	const handleWindowFocus = (appId) => {
		setOpenApps((prev) => {
			// Znajdź najwyższy zIndex
			const maxZIndex = Math.max(...prev.map((app) => app.zIndex), 0);

			return prev.map((app) => {
				if (app.id === appId) {
					return { ...app, zIndex: maxZIndex + 1 };
				}
				return app;
			});
		});
	};

	// Obsługa zamknięcia aplikacji
	const handleCloseApp = (appId) => {
		setOpenApps((prev) => prev.filter((app) => app.id !== appId));
		setMinimizedApps((prev) => prev.filter((id) => id !== appId));
	};

	// Obsługa minimalizacji aplikacji
	const handleMinimizeApp = (appId) => {
		if (!minimizedApps.includes(appId)) {
			setMinimizedApps((prev) => [...prev, appId]);
		}
	};

	// Obsługa przywracania aplikacji
	const handleRestoreApp = (appId) => {
		setMinimizedApps((prev) => prev.filter((id) => id !== appId));
	};

	// Obsługa maksymalizacji/przywracania rozmiaru aplikacji
	const handleMaximizeApp = (appId) => {
		setOpenApps((prev) =>
			prev.map((app) => {
				if (app.id === appId) {
					return {
						...app,
						windowState: app.windowState === 'normal' ? 'maximized' : 'normal',
					};
				}
				return app;
			})
		);
	};

	// Obsługa wyboru ikony
	const handleIconClick = (e, iconId) => {
		e.stopPropagation(); // Zapobiega kliknięciu na pulpit

		// Sprawdź, czy przytrzymano klawisz Ctrl podczas klikania
		const multiSelect = e.ctrlKey || e.metaKey;

		// Aktualizacja zaznaczonej ikony
		setDesktopIcons((icons) =>
			icons.map((icon) => {
				// Jeśli multiselect, zachowaj istniejące wybrane ikony i przełącz klikniętą
				if (multiSelect) {
					if (icon.id === iconId) {
						return { ...icon, selected: !icon.selected };
					}
					return icon;
				}
				// W przeciwnym razie wybierz tylko klikniętą ikonę
				else {
					return {
						...icon,
						selected: icon.id === iconId,
					};
				}
			})
		);
	};

	// Ustalenie pozycji i wymiarów selection boxa
	const getSelectionBoxStyle = () => {
		if (!selectionBox || !selectionBox.isVisible) return { display: 'none' };

		const left = Math.min(selectionBox.startX, selectionBox.endX);
		const top = Math.min(selectionBox.startY, selectionBox.endY);
		const width = Math.abs(selectionBox.endX - selectionBox.startX);
		const height = Math.abs(selectionBox.endY - selectionBox.startY);

		return {
			position: 'absolute',
			left: `${left}px`,
			top: `${top}px`,
			width: `${width}px`,
			height: `${height}px`,
			backgroundColor: 'rgba(0, 90, 200, 0.3)',
			border: '1px solid rgba(0, 120, 215, 0.9)',
			pointerEvents: 'none',
			zIndex: 10,
		};
	};

	return (
		<div className='h-screen w-screen overflow-hidden flex flex-col font-mono'>
			{/* Desktop z tapetą */}
			<div
				ref={desktopRef}
				className='flex-grow relative'
				style={{
					backgroundImage: 'url(/wallpaper/default.png)',
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
					backgroundColor: '#2d8f8f', // Kolor zapasowy, jeśli obraz się nie załaduje
				}}
				onMouseDown={handleMouseDown}>
				{/* Usunięto logo ze środka ekranu, ponieważ używamy tapety */}

				{/* Ikony na pulpicie */}
				{desktopIcons.map((icon) => (
					<Rnd
						key={icon.id}
						default={{
							x: icon.x,
							y: icon.y,
							width: 80,
							height: 90,
						}}
						position={{ x: icon.x, y: icon.y }}
						onDragStop={(e, d) => handleIconDragStop(icon.id, d)}
						onDragStart={(e) => {
							// Upewnij się, że ikona jest zaznaczona przed przeciągnięciem
							if (!icon.selected) {
								handleIconClick(e, icon.id);
							}
						}}
						dragHandleClassName='icon-drag-handle'
						enableResizing={false}
						bounds='parent'
						className='absolute'
						z={icon.selected ? 100 : 1}>
						<div
							id={`icon-${icon.id}`}
							className={`w-20 h-20 flex flex-col items-center justify-center text-center cursor-default select-none icon-drag-handle ${
								icon.selected ? 'bg-blue-500 bg-opacity-30' : ''
							}`}
							onClick={(e) => handleIconClick(e, icon.id)}
							onDoubleClick={() => handleDoubleClick(icon.id)}>
							<div className='text-3xl mb-1'>{icon.icon}</div>
							<div
								className='text-white text-xs px-1 py-0.5 rounded'
								style={{
									backgroundColor: icon.selected
										? 'transparent'
										: 'rgba(0,0,0,0.5)',
									textShadow: '1px 1px 1px rgba(0,0,0,0.7)',
								}}>
								{icon.name}
							</div>
						</div>
					</Rnd>
				))}

				{/* Okna aplikacji */}
				{openApps
					.filter((app) => !minimizedApps.includes(app.id))
					.map((app) => {
						// Określ styl okna na podstawie stanu (normalny/zmaksymalizowany)
						const windowStyle =
							app.windowState === 'maximized'
								? { width: '100%', height: 'calc(100% - 40px)', x: 0, y: 0 }
								: {
										width: app.size.width,
										height: app.size.height,
										x: app.position.x,
										y: app.position.y,
								  };

						return (
							<Rnd
								key={app.id}
								className='app-window'
								style={{ zIndex: app.zIndex }}
								default={{
									x: app.position.x,
									y: app.position.y,
									width: app.size.width,
									height: app.size.height,
								}}
								position={{ x: windowStyle.x, y: windowStyle.y }}
								size={{ width: windowStyle.width, height: windowStyle.height }}
								onDragStop={(e, d) => {
									setOpenApps((prev) =>
										prev.map((a) =>
											a.id === app.id
												? { ...a, position: { x: d.x, y: d.y } }
												: a
										)
									);
								}}
								onResizeStop={(e, direction, ref, delta, position) => {
									setOpenApps((prev) =>
										prev.map((a) =>
											a.id === app.id
												? {
														...a,
														size: {
															width: ref.offsetWidth,
															height: ref.offsetHeight,
														},
														position,
												  }
												: a
										)
									);
								}}
								dragHandleClassName='window-drag-handle'
								bounds='parent'
								enableResizing={app.windowState !== 'maximized'}
								disableDragging={app.windowState === 'maximized'}
								onMouseDown={() => handleWindowFocus(app.id)}>
								{app.id === 'memo-pad' && (
									<MemoPad
										app={app}
										onClose={() => handleCloseApp(app.id)}
										onMinimize={() => handleMinimizeApp(app.id)}
										onMaximize={() => handleMaximizeApp(app.id)}
										isMaximized={app.windowState === 'maximized'}
									/>
								)}

								{/* Inne aplikacje można dodać w podobny sposób */}
							</Rnd>
						);
					})}

				{/* Selection box */}
				<div style={getSelectionBoxStyle()}></div>

				{/* Start Menu połączony z paskiem zadań */}
				{isStartMenuOpen && (
					<div
						className='absolute left-0 bottom-10 w-64 bg-gray-300 border-2 border-white border-r-gray-700 border-b-0 shadow-lg start-menu'
						style={{ bottom: '10px', marginBottom: 0 }}>
						<div className='bg-blue-800 h-12 flex items-center p-2'>
							<span className='text-white font-bold'>QuantumFlux OS</span>
						</div>

						{/* Pole wyszukiwania */}
						<div className='p-2 border-b border-gray-400'>
							<div className='flex items-center bg-white border border-gray-500'>
								<input
									type='text'
									placeholder='Search...'
									className='w-full p-1 text-sm focus:outline-none'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
								<span className='px-2 text-gray-600'>🔍</span>
							</div>
						</div>

						<div className='p-2'>
							<div className='flex items-center p-2 hover:bg-blue-100 cursor-pointer'>
								<span className='mr-2'>📁</span>
								<span>Programs</span>
							</div>
							<div className='flex items-center p-2 hover:bg-blue-100 cursor-pointer'>
								<span className='mr-2'>📄</span>
								<span>Documents</span>
							</div>
							<div className='flex items-center p-2 hover:bg-blue-100 cursor-pointer'>
								<span className='mr-2'>⚙️</span>
								<span>Settings</span>
							</div>
							<div className='border-t border-gray-400 my-2'></div>
							<div
								className='flex items-center p-2 hover:bg-blue-100 cursor-pointer'
								onClick={handleLogout}>
								<span className='mr-2'>🚪</span>
								<span>Log Off</span>
							</div>
							<div className='flex items-center p-2 hover:bg-blue-100 cursor-pointer'>
								<span className='mr-2'>⏻</span>
								<span>Shut Down</span>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Pasek zadań */}
			<div className='h-10 bg-gray-300 border-t-2 border-white flex items-center justify-between'>
				{/* Przycisk Start - aktywny stan gdy menu jest otwarte */}
				<button
					className={`bg-gray-300 px-4 py-1 border-2 mx-1 h-8 flex items-center focus:outline-none ${
						isStartMenuOpen
							? 'border-r-white border-b-white border-l-gray-700 border-t-gray-700 bg-gray-400'
							: 'border-white border-r-gray-700 border-b-gray-700'
					}`}
					onClick={toggleStartMenu}>
					<span className='font-bold'>Start</span>
				</button>

				{/* Pasek zadań po środku */}
				<div className='flex-grow flex items-center'>
					{/* Ikony zminimalizowanych aplikacji */}
					{minimizedApps.map((appId) => {
						const app = openApps.find((a) => a.id === appId);
						if (!app) return null;

						return (
							<div
								key={app.id}
								className='h-8 px-2 mx-1 flex items-center cursor-pointer border-2 border-gray-400 border-t-white border-l-white bg-gray-300 hover:bg-gray-400'
								onClick={() => handleRestoreApp(app.id)}>
								<span className='mr-1'>{app.icon}</span>
								<span className='text-xs truncate max-w-24'>{app.name}</span>
							</div>
						);
					})}
				</div>

				{/* Zegar w prawym dolnym rogu */}
				<div className='px-2 h-8 border border-gray-700 bg-gray-300 flex items-center text-sm'>
					{currentTime.toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</div>
			</div>
		</div>
	);
};

export default Desktop;
