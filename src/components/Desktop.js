import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import MemoPad from './MemoPad';
// Zalecamy umieszczenie obrazka w folderze public/wallpaper/ i użycie poniższej ścieżki

const ContextMenu = ({ x, y, onClose, menuItems }) => {
	// Zamknij menu przy kliknięciu poza nim
	useEffect(() => {
		const handleClickOutside = () => {
			onClose();
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [onClose]);

	return (
		<div
			className='absolute bg-gray-200 border-2 border-gray-700 shadow-lg rounded z-50'
			style={{
				left: `${x}px`,
				top: `${y}px`,
				minWidth: '200px',
			}}
			onClick={(e) => e.stopPropagation()}>
			{menuItems.map((item, index) => (
				<React.Fragment key={index}>
					{item.separator ? (
						<div className='border-t border-gray-400 my-1'></div>
					) : (
						<button
							className='w-full text-left px-4 py-2 hover:bg-blue-100 flex items-center'
							onClick={() => {
								item.onClick();
								onClose();
							}}
							disabled={item.disabled}>
							{item.icon && <span className='mr-2'>{item.icon}</span>}
							<span>{item.label}</span>
						</button>
					)}
				</React.Fragment>
			))}
		</div>
	);
};

const Desktop = ({ user, onLogout }) => {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectionBox, setSelectionBox] = useState(null);
	const desktopRef = useRef(null);
	const [trash, setTrash] = useState([]);

	// Stan dla menu kontekstowego
	const [contextMenu, setContextMenu] = useState({
		show: false,
		x: 0,
		y: 0,
		target: null,
	});

	// Stan dla dialogu zmiany nazwy
	const [renameDialog, setRenameDialog] = useState({
		show: false,
		iconId: null,
		currentName: '',
		newName: '',
	});

	// Stan dla ikon pulpitu
	const [desktopIcons, setDesktopIcons] = useState([
		{
			id: 'command-prompt',
			name: 'CommandX',
			icon: '💻',
			x: 20,
			y: 20,
			selected: false,
			appType: 'command',
			isSystemIcon: true,
		},
		{
			id: 'trash',
			name: 'Kosz',
			icon: '🗑️',
			x: 20,
			y: 120,
			selected: false,
			appType: 'trash',
			isSystemIcon: true,
		},
		{
			id: 'pixel-studio',
			name: 'PixelStudio',
			icon: '🎨',
			x: 20,
			y: 220,
			selected: false,
			appType: 'pixel-studio',
			isSystemIcon: true,
		},
		{
			id: 'memo-pad',
			name: 'MemoPad',
			icon: '📝',
			x: 20,
			y: 320,
			selected: false,
			appType: 'memo-pad',
			isSystemIcon: true,
		},
		{
			id: 'flux-code',
			name: 'FluxCode',
			icon: '⚙️',
			x: 20,
			y: 420,
			selected: false,
			appType: 'flux-code',
			isSystemIcon: true,
		},
	]);

	// Stan aplikacji
	const [openApps, setOpenApps] = useState([]);
	const [minimizedApps, setMinimizedApps] = useState([]);

	// Ładowanie zapisanych plików z localStorage
	useEffect(() => {
		// Ładowanie plików z pulpitu
		const filesData = JSON.parse(
			localStorage.getItem('quantumflux-files') || '{}'
		);
		const desktopFiles = filesData.desktop || [];

		// Dodaj ikony plików do pulpitu
		if (desktopFiles.length > 0) {
			const fileIcons = desktopFiles.map((file, index) => ({
				id: `file-${Date.now()}-${index}`,
				name: file.name,
				icon: '📄', // Możesz dostosować ikonę do typu pliku
				x: 120 + ((index * 30) % 200),
				y: 120 + Math.floor((index * 30) / 200) * 100,
				selected: false,
				appType: file.type,
				fileData: file,
				isSystemIcon: false,
			}));

			setDesktopIcons((prev) => [...prev, ...fileIcons]);
		}

		// Ładowanie zawartości kosza
		const trashData = JSON.parse(
			localStorage.getItem('quantumflux-trash') || '[]'
		);
		setTrash(trashData);
	}, []);

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

	// Dodawanie nowej ikony na pulpit (dla plików)
	const addDesktopIcon = (iconData) => {
		setDesktopIcons((prev) => [...prev, { ...iconData, isSystemIcon: false }]);
	};

	// Obsługa menu kontekstowego
	const handleContextMenu = (e, iconId) => {
		e.preventDefault(); // Zapobiega pokazywaniu domyślnego menu przeglądarki
		e.stopPropagation();

		// Znajdź dane ikony
		const targetIcon = desktopIcons.find((icon) => icon.id === iconId);

		if (targetIcon) {
			// Pokaż menu kontekstowe dla ikony
			setContextMenu({
				show: true,
				x: e.clientX,
				y: e.clientY,
				target: targetIcon,
			});

			// Zaznacz ikonę jeśli nie jest jeszcze zaznaczona
			if (!targetIcon.selected) {
				handleIconClick(e, iconId);
			}
		}
	};

	// Obsługa menu kontekstowego dla pulpitu
	const handleDesktopContextMenu = (e) => {
		// Upewnij się, że kliknięcie było na pulpicie, a nie na ikonie
		if (
			e.target.closest('.icon-drag-handle') ||
			e.target.closest('.app-window')
		) {
			return;
		}

		e.preventDefault();

		// Pokaż menu kontekstowe dla pulpitu
		setContextMenu({
			show: true,
			x: e.clientX,
			y: e.clientY,
			target: 'desktop',
		});
	};

	// Zamykanie menu kontekstowego
	const closeContextMenu = () => {
		setContextMenu({
			show: false,
			x: 0,
			y: 0,
			target: null,
		});
	};

	// Obsługa zmiany nazwy pliku
	const handleRename = (iconId) => {
		const icon = desktopIcons.find((icon) => icon.id === iconId);
		if (icon && !icon.isSystemIcon) {
			setRenameDialog({
				show: true,
				iconId: iconId,
				currentName: icon.name,
				newName: icon.name,
			});
		}
	};

	// Zapisywanie nowej nazwy pliku
	const saveNewFileName = () => {
		if (
			!renameDialog.newName ||
			renameDialog.newName === renameDialog.currentName
		) {
			setRenameDialog({
				show: false,
				iconId: null,
				currentName: '',
				newName: '',
			});
			return;
		}

		// Aktualizuj ikonę na pulpicie
		setDesktopIcons((icons) =>
			icons.map((icon) => {
				if (icon.id === renameDialog.iconId) {
					// Zachowaj rozszerzenie pliku
					let newName = renameDialog.newName;
					if (icon.fileData && icon.name.includes('.')) {
						const extension = icon.name.split('.').pop();
						if (!newName.endsWith(`.${extension}`)) {
							newName = `${newName}.${extension}`;
						}
					}

					// Aktualizuj dane pliku w localStorage jeśli to plik
					if (icon.fileData) {
						const filesData = JSON.parse(
							localStorage.getItem('quantumflux-files') || '{}'
						);
						const desktopFiles = filesData.desktop || [];

						const fileIndex = desktopFiles.findIndex(
							(file) => file.name === icon.name && file.type === icon.appType
						);

						if (fileIndex !== -1) {
							desktopFiles[fileIndex].name = newName;
							filesData.desktop = desktopFiles;
							localStorage.setItem(
								'quantumflux-files',
								JSON.stringify(filesData)
							);
						}
					}

					return {
						...icon,
						name: newName,
						fileData: icon.fileData
							? { ...icon.fileData, name: newName }
							: null,
					};
				}
				return icon;
			})
		);

		// Zamknij dialog
		setRenameDialog({
			show: false,
			iconId: null,
			currentName: '',
			newName: '',
		});
	};

	// Obsługa usuwania pliku
	const handleDelete = (iconId) => {
		const icon = desktopIcons.find((icon) => icon.id === iconId);
		if (!icon || icon.isSystemIcon) return;

		// Dodaj plik do kosza
		if (icon.fileData) {
			const newTrashItem = {
				id: `trash-${Date.now()}`,
				originalIcon: { ...icon },
				deletedAt: new Date().toISOString(),
			};

			const updatedTrash = [...trash, newTrashItem];
			setTrash(updatedTrash);

			// Zapisz zaktualizowany kosz w localStorage
			localStorage.setItem('quantumflux-trash', JSON.stringify(updatedTrash));

			// Usuń plik z pulpitu w localStorage
			const filesData = JSON.parse(
				localStorage.getItem('quantumflux-files') || '{}'
			);
			const desktopFiles = filesData.desktop || [];

			const fileIndex = desktopFiles.findIndex(
				(file) => file.name === icon.name && file.type === icon.appType
			);

			if (fileIndex !== -1) {
				desktopFiles.splice(fileIndex, 1);
				filesData.desktop = desktopFiles;
				localStorage.setItem('quantumflux-files', JSON.stringify(filesData));
			}
		}

		// Usuń ikonę z pulpitu
		setDesktopIcons((icons) => icons.filter((i) => i.id !== iconId));
	};

	// Otwarcie kosza
	const openTrash = () => {
		// Sprawdź, czy aplikacja jest już otwarta
		const isOpen = openApps.some((app) => app.appType === 'trash');

		if (isOpen) {
			// Znajdź identyfikator otwartej aplikacji
			const app = openApps.find((app) => app.appType === 'trash');

			if (app) {
				// Jeśli aplikacja jest zminimalizowana, przywróć ją
				if (minimizedApps.includes(app.id)) {
					handleRestoreApp(app.id);
				}

				// Przenieś okno na wierzch
				handleWindowFocus(app.id);
			}

			return;
		}

		// Otwórz nowe okno kosza
		const appId = `trash-${Date.now()}`;

		setOpenApps((prev) => [
			...prev,
			{
				id: appId,
				name: 'Kosz',
				icon: '🗑️',
				windowState: 'normal',
				zIndex: openApps.length + 1,
				position: {
					x: 150,
					y: 150,
				},
				size: {
					width: 600,
					height: 400,
				},
				appType: 'trash',
				trashItems: trash,
			},
		]);
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

		// Zamknij menu kontekstowe
		if (contextMenu.show) {
			closeContextMenu();
			return;
		}

		// Usuń zaznaczenie ikon przy kliknięciu na pusty obszar pulpitu
		setDesktopIcons((icons) =>
			icons.map((icon) => ({
				...icon,
				selected: false,
			}))
		);

		// Tylko lewy przycisk myszy rozpoczyna selection box
		if (e.button !== 0) return;

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
	const handleDoubleClick = (iconId) => {
		// Pobierz dane ikony
		const icon = desktopIcons.find((icon) => icon.id === iconId);
		if (!icon) return;

		// Specjalne traktowanie kosza
		if (icon.appType === 'trash') {
			openTrash();
			return;
		}

		// Sprawdź, czy to ikona pliku czy aplikacji
		if (icon.fileData) {
			// Jeśli to plik, otwórz odpowiednią aplikację z zawartością pliku
			openFileWithApp(icon);
		} else {
			// Standardowe otwieranie aplikacji
			openApp(icon.appType, icon);
		}
	};

	// Otwieranie pliku w odpowiedniej aplikacji
	const openFileWithApp = (fileIcon) => {
		if (!fileIcon || !fileIcon.fileData) return;

		const { fileData, appType } = fileIcon;

		// Sprawdź czy taki plik jest już otwarty
		const isOpen = openApps.some(
			(app) =>
				app.fileData &&
				app.fileData.name === fileData.name &&
				app.id.includes(appType)
		);

		if (isOpen) {
			// Jeśli plik jest już otwarty, znajdź go i przywróć, jeśli jest zminimalizowany
			const openAppIndex = openApps.findIndex(
				(app) =>
					app.fileData &&
					app.fileData.name === fileData.name &&
					app.id.includes(appType)
			);

			if (openAppIndex !== -1) {
				const appId = openApps[openAppIndex].id;

				// Sprawdź czy aplikacja jest zminimalizowana
				if (minimizedApps.includes(appId)) {
					// Przywróć ją
					handleRestoreApp(appId);
				}

				// Przenieś na wierzch
				handleWindowFocus(appId);
			}

			return;
		}

		// Jeśli plik nie jest otwarty, otwórz go w odpowiedniej aplikacji
		switch (appType) {
			case 'memo-pad':
				// Otwórz notatnik z zawartością pliku
				const appId = `memo-pad-file-${Date.now()}`;
				setOpenApps((prev) => [
					...prev,
					{
						id: appId,
						name: fileData.name,
						icon: '📝',
						windowState: 'normal',
						zIndex: openApps.length + 1,
						position: {
							x: 100 + openApps.length * 30,
							y: 100 + openApps.length * 30,
						},
						size: {
							width: 600,
							height: 400,
						},
						appType: 'memo-pad',
						fileData: fileData,
					},
				]);
				break;

			// Dodaj inne typy plików i odpowiednie aplikacje
			default:
				console.log('Nieobsługiwany typ pliku:', appType);
				break;
		}
	};

	// Otwieranie aplikacji
	const openApp = (appType, icon) => {
		// Sprawdź, czy aplikacja jest już otwarta
		const isOpen = openApps.some(
			(app) => app.appType === appType && !app.fileData
		);

		if (isOpen) {
			// Znajdź identyfikator otwartej aplikacji
			const app = openApps.find(
				(app) => app.appType === appType && !app.fileData
			);

			if (app) {
				// Jeśli aplikacja jest zminimalizowana, przywróć ją
				if (minimizedApps.includes(app.id)) {
					handleRestoreApp(app.id);
				}

				// Przenieś okno na wierzch
				handleWindowFocus(app.id);
			}

			return;
		}

		// Otwórz nową instancję aplikacji
		const appId = `${appType}-${Date.now()}`;

		setOpenApps((prev) => [
			...prev,
			{
				id: appId,
				name: icon.name,
				icon: icon.icon,
				windowState: 'normal',
				zIndex: openApps.length + 1,
				position: {
					x: 100 + openApps.length * 30,
					y: 100 + openApps.length * 30,
				},
				size: {
					width: 600,
					height: 400,
				},
				appType: appType,
			},
		]);
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
				onMouseDown={handleMouseDown}
				onContextMenu={handleDesktopContextMenu}>
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
							onDoubleClick={() => handleDoubleClick(icon.id)}
							onContextMenu={(e) => handleContextMenu(e, icon.id)}>
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
								{app.appType === 'memo-pad' && (
									<MemoPad
										app={app}
										onClose={() => handleCloseApp(app.id)}
										onMinimize={() => handleMinimizeApp(app.id)}
										onMaximize={() => handleMaximizeApp(app.id)}
										isMaximized={app.windowState === 'maximized'}
										addDesktopIcon={addDesktopIcon}
									/>
								)}

								{app.appType === 'trash' && (
									<div className='flex flex-col w-full h-full bg-gray-200 border border-gray-400'>
										{/* Pasek tytułowy kosza */}
										<div className='window-drag-handle h-8 bg-blue-800 text-white flex items-center justify-between px-2'>
											<div className='flex items-center'>
												<span className='mr-2'>🗑️</span>
												<span>Kosz</span>
											</div>
											<div className='flex items-center'>
												{/* Przyciski kontrolne okna */}
												<button
													className='w-6 h-6 mr-1 flex items-center justify-center bg-gray-300 text-black border border-gray-400 hover:bg-gray-400'
													onClick={() => handleMinimizeApp(app.id)}>
													_
												</button>
												<button
													className='w-6 h-6 mr-1 flex items-center justify-center bg-gray-300 text-black border border-gray-400 hover:bg-gray-400'
													onClick={() => handleMaximizeApp(app.id)}>
													{app.windowState === 'maximized' ? '❐' : '□'}
												</button>
												<button
													className='w-6 h-6 flex items-center justify-center bg-gray-300 text-black border border-gray-400 hover:bg-red-400'
													onClick={() => handleCloseApp(app.id)}>
													✕
												</button>
											</div>
										</div>

										{/* Pasek narzędzi kosza */}
										<div className='flex items-center bg-gray-300 border-b border-gray-400 p-2'>
											<button className='px-4 py-1 bg-gray-400 border border-gray-500 hover:bg-gray-500 mr-2'>
												Przywróć zaznaczone
											</button>
											<button className='px-4 py-1 bg-gray-400 border border-gray-500 hover:bg-gray-500'>
												Opróżnij kosz
											</button>
										</div>

										{/* Lista elementów w koszu */}
										<div className='flex-grow p-2 overflow-auto'>
											{app.trashItems && app.trashItems.length > 0 ? (
												<div className='grid grid-cols-4 gap-4'>
													{app.trashItems.map((item) => (
														<div
															key={item.id}
															className='flex flex-col items-center p-2 hover:bg-gray-300 cursor-pointer'>
															<div className='text-3xl mb-1'>
																{item.originalIcon.icon}
															</div>
															<div className='text-xs text-center truncate w-full'>
																{item.originalIcon.name}
															</div>
															<div className='text-xs text-gray-500'>
																{new Date(item.deletedAt).toLocaleDateString()}
															</div>
														</div>
													))}
												</div>
											) : (
												<div className='flex items-center justify-center h-full text-gray-500'>
													Kosz jest pusty
												</div>
											)}
										</div>

										{/* Pasek stanu */}
										<div className='h-6 bg-gray-300 border-t border-gray-400 px-2 flex items-center text-xs'>
											{app.trashItems
												? `${app.trashItems.length} elementów`
												: '0 elementów'}
										</div>
									</div>
								)}

								{/* Inne aplikacje można dodać w podobny sposób */}
							</Rnd>
						);
					})}

				{/* Selection box */}
				<div style={getSelectionBoxStyle()}></div>

				{/* Menu kontekstowe */}
				{contextMenu.show && (
					<ContextMenu
						x={contextMenu.x}
						y={contextMenu.y}
						onClose={closeContextMenu}
						menuItems={
							contextMenu.target === 'desktop'
								? // Menu dla pulpitu
								  [
										{
											label: 'Odśwież',
											icon: '🔄',
											onClick: () => window.location.reload(),
										},
										{
											label: 'Nowy folder',
											icon: '📁',
											onClick: () => console.log('Nowy folder'),
										},
										{ separator: true },
										{
											label: 'Sortuj według nazwy',
											icon: '🔤',
											onClick: () => console.log('Sortuj wg nazwy'),
										},
										{
											label: 'Sortuj według daty',
											icon: '📅',
											onClick: () => console.log('Sortuj wg daty'),
										},
										{ separator: true },
										{
											label: 'Właściwości',
											icon: '⚙️',
											onClick: () => console.log('Właściwości pulpitu'),
										},
								  ]
								: // Menu dla ikony/pliku
								  [
										{
											label: 'Otwórz',
											icon: '📂',
											onClick: () => handleDoubleClick(contextMenu.target.id),
										},
										{ separator: true },
										{
											label: 'Zmień nazwę',
											icon: '✏️',
											onClick: () => handleRename(contextMenu.target.id),
											disabled: contextMenu.target.isSystemIcon,
										},
										{
											label: 'Usuń',
											icon: '🗑️',
											onClick: () => handleDelete(contextMenu.target.id),
											disabled: contextMenu.target.isSystemIcon,
										},
										{ separator: true },
										{
											label: 'Właściwości',
											icon: '⚙️',
											onClick: () => console.log('Właściwości pliku'),
										},
								  ]
						}
					/>
				)}

				{/* Dialog zmiany nazwy */}
				{renameDialog.show && (
					<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
						<div className='bg-gray-200 border-2 border-gray-700 p-4 w-80 shadow-xl'>
							<div className='text-lg font-bold mb-4'>Zmień nazwę</div>

							<div className='mb-4'>
								<input
									type='text'
									className='w-full p-2 border border-gray-400'
									value={renameDialog.newName}
									onChange={(e) =>
										setRenameDialog({
											...renameDialog,
											newName: e.target.value,
										})
									}
									autoFocus
								/>
							</div>

							<div className='flex justify-end space-x-2'>
								<button
									className='px-4 py-2 border border-gray-400 bg-gray-300 hover:bg-gray-400'
									onClick={() =>
										setRenameDialog({
											show: false,
											iconId: null,
											currentName: '',
											newName: '',
										})
									}>
									Anuluj
								</button>
								<button
									className='px-4 py-2 border border-gray-400 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200'
									onClick={saveNewFileName}
									disabled={
										!renameDialog.newName.trim() ||
										renameDialog.newName === renameDialog.currentName
									}>
									Zmień
								</button>
							</div>
						</div>
					</div>
				)}

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
