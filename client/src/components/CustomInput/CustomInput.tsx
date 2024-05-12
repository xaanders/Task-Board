import React, { useState } from "react";

import { X } from "react-feather";

import "./CustomInput.css";
interface CustomInputProps {
  text: string;
  onSubmit: (value: string) => void;
  displayClass?: string;
  editClass?: string;
  placeholder?: string;
  defaultValue?: string;
  buttonText?: string;
  textArea?: boolean;
}
function CustomInput({ text,
  onSubmit,
  displayClass,
  editClass,
  placeholder,
  defaultValue,
  buttonText,
  textArea }: CustomInputProps) {

  const [isCustomInput, setIsCustomInput] = useState(false);
  const [inputText, setInputText] = useState(defaultValue || "");

  const submission = (e: any) => {
    e.preventDefault();
    if (inputText && onSubmit) {
      setInputText("");
      onSubmit(inputText);
    }
    setIsCustomInput(false);
  };

  return (
    <div className="custom-input">
      {isCustomInput ? (
        <form
          className={`custom-input-edit ${editClass ? editClass : ""}`}
          onSubmit={submission}
        >
          {textArea ? 
          <textarea
          maxLength={1000}
          cols={10}
          autoFocus
          className="textArea"
          value={inputText}
          placeholder={placeholder || text}
          onChange={(event) => setInputText(event.target.value)}
          />
          :
          <input
          type="text"
          autoFocus
          value={inputText}
          placeholder={placeholder || text}
          onChange={(event) => setInputText(event.target.value)}
          />
        }
          
          <div className="custom-input-edit-footer">
            <button type="submit">{buttonText || "Add"}</button>
            <X onClick={() => setIsCustomInput(false)} className="closeIcon" />
          </div>
        </form>
      ) : (
        <p
          className={`custom-input-display ${displayClass ? displayClass : ""}`}
          onClick={() => setIsCustomInput(true)}
        >
          {text}
        </p>
      )}
    </div>
  );
}

export default CustomInput;
