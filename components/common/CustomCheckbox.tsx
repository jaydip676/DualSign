import React, { useState, FC } from 'react';

interface CustomCheckboxProps {
    isERC20: boolean;
    onChange: (value: boolean) => void; // Callback to pass the value to the parent
}

const CustomCheckbox: FC<CustomCheckboxProps> = ({ onChange, isERC20 }) => {
    const [isChecked, setIsChecked] = useState<boolean>(isERC20 ? true : false);
    return (
        <div className="flex items-center">
            <input
                type="checkbox"
                id="custom-checkbox"
                className="hidden peer"
                checked={isChecked}
                onChange={onChange}
            />
            <label
                htmlFor="custom-checkbox"
                className="flex items-center cursor-pointer text-gray-700"
            >
                <div className="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center mr-2 peer-checked:bg-indigo-600 peer-checked:border-indigo-600">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="hidden w-4 h-4 text-white peer-checked:block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
            </label>
        </div>
    );
};

export default CustomCheckbox;
