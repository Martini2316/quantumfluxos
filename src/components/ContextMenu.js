import React, { useEffect } from 'react';

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

export default ContextMenu;
