import React, { useEffect } from "react";

import "./Modal.css";
import { X } from "react-feather";

function Modal(props: any) {

  useEffect(() => {
    const body = document.querySelector('body');
    if (body)
      body.style.overflow = "hidden";

    return () => {
      if (body)
        body.style.overflow = "auto"
    }
  }, [])

  return (
    <div
      className="modal"
    >
      <div className="modal-scrollable">
        <div
          className="modal-content custom-scroll"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="modal-header">
            <X style={{ cursor: "pointer" }} onClick={() => props?.onClose() || {}} />
          </div>
          <div>
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
