import React, { useState, useEffect } from 'react';

const BootScreen = () => {
	const [progress, setProgress] = useState(0);
	const [loadedFiles, setLoadedFiles] = useState([]);
	const [currentFile, setCurrentFile] = useState('');

	// Lista plików systemowych do "załadowania"
	const systemFiles = [
		'kernel.sys',
		'quantum_core.dll',
		'system32/flux_init.bin',
		'system32/boot_manager.bin',
		'system32/hal.dll',
		'drivers/display.drv',
		'drivers/keyboard.drv',
		'drivers/mouse.drv',
		'drivers/sound.drv',
		'drivers/usb.drv',
		'drivers/network_adapter.drv',
		'system32/memory_manager.bin',
		'system32/process_scheduler.bin',
		'system32/file_system.bin',
		'system32/security_controller.dll',
		'system32/crypto_engine.dll',
		'registry/user_settings.reg',
		'registry/system_config.reg',
		'registry/hardware.reg',
		'services/network.srv',
		'services/security.srv',
		'services/device_manager.srv',
		'services/print_spooler.srv',
		'services/update_engine.srv',
		'libraries/common/strings.lib',
		'libraries/common/math.lib',
		'libraries/common/io.lib',
		'libraries/graphics/render.lib',
		'libraries/graphics/fonts.lib',
		'gui/desktop_manager.bin',
		'gui/window_system.bin',
		'gui/themes/quantum.thm',
		'gui/fonts/system.fnt',
		'applications/explorer.exe',
		'applications/notepad.exe',
		'applications/paint.exe',
		'applications/terminal.exe',
		'applications/calculator.exe',
		'system32/startup.bin',
	];

	// Funkcja do automatycznego przewijania konsoli
	const scrollToBottom = () => {
		const consoleOutput = document.getElementById('console-output');
		if (consoleOutput) {
			consoleOutput.scrollTop = consoleOutput.scrollHeight;
		}
	};

	// Animacja paska ładowania i ładowania plików
	useEffect(() => {
		let currentIndex = 0;

		const interval = setInterval(() => {
			// Aktualizacja progresu
			setProgress((prevProgress) => {
				const increment = Math.random() * 5 + 2; // Wolniejszy przyrost, żeby pokazać więcej plików
				const newProgress = prevProgress + increment;
				return newProgress > 100 ? 100 : newProgress;
			});

			// "Ładowanie" plików
			if (currentIndex < systemFiles.length) {
				const file = systemFiles[currentIndex];
				setCurrentFile(file);

				setTimeout(() => {
					setLoadedFiles((prev) => {
						const newLoadedFiles = [...prev, file];
						// Przewiń konsolę po aktualizacji listy plików
						setTimeout(scrollToBottom, 10);
						return newLoadedFiles;
					});
				}, Math.random() * 150 + 50);

				currentIndex++;
			} else {
				setCurrentFile('System initialized');
				setTimeout(scrollToBottom, 10);
			}
		}, 150); // Szybsze ładowanie plików

		return () => clearInterval(interval);
	}, []);

	// Efekt zapewniający przewijanie przy każdej aktualizacji loadedFiles
	useEffect(() => {
		scrollToBottom();
	}, [loadedFiles, currentFile]);

	return (
		<div className='h-full w-full bg-black flex flex-col items-center justify-center text-white p-8 font-mono'>
			<div className='mb-8 text-center'>
				<h1 className='text-4xl font-bold mb-2'>QuantumFlux OS</h1>
				<p className='text-xl'>Version 1.0</p>
			</div>

			<div className='w-full max-w-md'>
				<div className='mb-2 flex justify-between'>
					<span>Loading system files...</span>
					<span>{Math.round(progress)}%</span>
				</div>

				<div className='w-full h-6 bg-gray-700 border-2 border-gray-500'>
					<div
						className='h-full bg-blue-500 transition-all duration-200'
						style={{ width: `${progress}%` }}></div>
				</div>

				<div
					className='mt-4 font-mono text-sm text-green-500 bg-black p-4 h-48 overflow-y-auto'
					id='console-output'>
					<div className='flex'>
						<span className='text-white mr-2'>$</span>
						<span>Initializing QuantumFlux OS...</span>
					</div>

					{loadedFiles.map((file, index) => (
						<div key={index} className='flex mt-1'>
							<span className='text-white mr-2'>$</span>
							<span>
								Loading: {file} <span className='text-white ml-2'>[ OK ]</span>
							</span>
						</div>
					))}

					{currentFile && !loadedFiles.includes(currentFile) && (
						<div className='flex mt-1'>
							<span className='text-white mr-2'>$</span>
							<span>Loading: {currentFile}</span>
						</div>
					)}
				</div>
			</div>

			<div className='mt-auto text-xs text-gray-500'>
				&copy; 2025 QuantumFlux OS by Martin Schneider
			</div>
		</div>
	);
};

export default BootScreen;
